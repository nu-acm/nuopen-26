/**
 * NU Open 2026 webhook for sign-in codes and CV storage.
 *
 * The site POSTs JSON to this web app, always with { secret, action }:
 *   send-otp   { email, otp, type }  emails the 6-digit code
 *   upload-cv  { fileName, base64 }  saves a PDF to the CV folder → { fileId }
 *   delete-cv  { fileId }            moves that CV to the Drive trash
 * Mail is sent and files are owned by the account that deployed the script.
 *
 * Setup (see README.md):
 *   1. Project Settings → Script Properties → add GAS_SECRET (same value as the site's).
 *   2. Deploy → New deployment → Web app; Execute as: Me; Who has access: Anyone.
 *   3. Put the /exec URL in the site's GAS_URL.
 *
 * Apps Script web apps always answer HTTP 200, so the result is in the body:
 *   { ok: true } or { ok: false, error: '...' }.
 */

const EVENT_NAME = 'NU Open';

const OTP_PATTERN = /^\d{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LIFETIME_MINUTES = 5;
const CV_FOLDER_NAME = 'NU Open 2026 CVs';
const CV_MAX_BYTES = 2 * 1024 * 1024;
const FILE_ID_PATTERN = /^[\w-]{10,200}$/;

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    const expected = PropertiesService.getScriptProperties().getProperty('GAS_SECRET');
    if (!expected) return reply({ ok: false, error: 'GAS_SECRET script property is not set' });
    if (body.secret !== expected) return reply({ ok: false, error: 'Unauthorized' });

    if (body.action === 'send-otp') return sendOtp(body);
    if (body.action === 'upload-cv') return uploadCv(body);
    if (body.action === 'delete-cv') return deleteCv(body);
    return reply({ ok: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: String(err) });
  }
}

/** Visit the /exec URL in a browser to confirm the deployment is live. */
function doGet() {
  return reply({
    ok: true,
    service: EVENT_NAME + ' mailer',
    quotaLeft: MailApp.getRemainingDailyQuota(),
  });
}

function sendOtp(body) {
  const email = String(body.email || '').trim();
  const otp = String(body.otp || '');
  if (!EMAIL_PATTERN.test(email)) return reply({ ok: false, error: 'Invalid email' });
  if (!OTP_PATTERN.test(otp)) return reply({ ok: false, error: 'Invalid code' });

  MailApp.sendEmail({
    to: email,
    subject: otp + ' is your ' + EVENT_NAME + ' verification code',
    body:
      otp +
      ' is your ' +
      EVENT_NAME +
      ' verification code.\n\nEnter it at nuopen.nuacm.kz. Expires in ' +
      CODE_LIFETIME_MINUTES +
      ' minutes.\n\nIf you did not request this code, ignore this email.',
    htmlBody: otpHtml(otp),
    name: EVENT_NAME,
  });

  return reply({ ok: true });
}

function otpHtml(otp) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background-color:#ffffff;color:#111111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;background-color:#ffffff">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:440px;font-family:Arial,Helvetica,sans-serif;text-align:center">
<tr><td>
<h1 style="margin:0 0 20px;font-size:16px;line-height:24px;font-weight:normal;color:#555555">${EVENT_NAME} verification code</h1>
<p style="margin:0 0 20px;font-family:Consolas,Monaco,monospace;font-size:44px;line-height:56px;font-weight:bold;letter-spacing:4px;color:#2563eb"><span style="white-space:nowrap;-webkit-user-select:all;user-select:all">${otp}</span></p>
<p style="margin:0;font-size:15px;line-height:24px;color:#333333">Enter it at nuopen.nuacm.kz.<br>Expires in ${CODE_LIFETIME_MINUTES} minutes.</p>
<p style="margin:28px 0 0;font-size:13px;line-height:20px;color:#666666">If you did not request this code, ignore this email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * The private Drive folder CVs go into. Uses the CV_FOLDER_ID script property
 * when set; otherwise creates the folder once and remembers its id.
 */
function getCvFolder() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('CV_FOLDER_ID');
  if (id) return DriveApp.getFolderById(id);
  const folder = DriveApp.createFolder(CV_FOLDER_NAME);
  props.setProperty('CV_FOLDER_ID', folder.getId());
  return folder;
}

function uploadCv(body) {
  const fileName = String(body.fileName || '').slice(0, 120);
  if (!/\.pdf$/i.test(fileName)) return reply({ ok: false, error: 'Invalid file name' });

  const bytes = Utilities.base64Decode(String(body.base64 || ''));
  if (bytes.length === 0 || bytes.length > CV_MAX_BYTES)
    return reply({ ok: false, error: 'Invalid file size' });

  const blob = Utilities.newBlob(bytes, 'application/pdf', fileName);
  const file = getCvFolder().createFile(blob);
  return reply({ ok: true, fileId: file.getId() });
}

function deleteCv(body) {
  const fileId = String(body.fileId || '');
  if (!FILE_ID_PATTERN.test(fileId)) return reply({ ok: false, error: 'Invalid file id' });

  let file;
  try {
    file = DriveApp.getFileById(fileId);
  } catch (err) {
    // Already gone (deleted by hand in Drive): nothing left to do.
    return reply({ ok: true });
  }

  // Only ever touch files inside the CV folder, whatever id is sent.
  const folderId = getCvFolder().getId();
  const parents = file.getParents();
  let inFolder = false;
  while (parents.hasNext()) if (parents.next().getId() === folderId) inFolder = true;
  if (!inFolder) return reply({ ok: false, error: 'File is not in the CV folder' });

  file.setTrashed(true);
  return reply({ ok: true });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** Move this event's sent code messages older than 24 hours to Trash. */
function cleanupOldCodes() {
  const sender = Session.getEffectiveUser().getEmail().trim().toLowerCase();
  if (!EMAIL_PATTERN.test(sender)) throw new Error('Cannot identify the sending account');

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const suffixes = [
    ' is your ' + EVENT_NAME + ' verification code',
    ' is your ' + EVENT_NAME + ' code',
  ];
  for (const suffix of suffixes) {
    const threads = GmailApp.search(
      'in:sent -in:trash older_than:1d from:' + sender + ' subject:"' + suffix.trim() + '"',
      0,
      100,
    );
    for (const thread of threads) {
      for (const message of thread.getMessages()) {
        const rawFrom = message.getFrom();
        const from = (rawFrom.match(/<([^>]+)>/)?.[1] || rawFrom).trim().toLowerCase();
        const subject = message.getSubject();
        const otp = subject.slice(0, 6);

        if (
          from === sender &&
          OTP_PATTERN.test(otp) &&
          subject === otp + suffix &&
          message.getDate().getTime() < cutoff &&
          !message.isDraft() &&
          !message.isInTrash()
        ) {
          message.moveToTrash();
        }
      }
    }
  }
}

/**
 * Run this once from the editor to grant mail and Drive permission: it sends
 * you a test code and creates the CV folder.
 */
function testSendToMe() {
  const me = Session.getActiveUser().getEmail();
  sendOtp({ email: me, otp: '123456' });
  console.log('CV folder: ' + getCvFolder().getUrl());
  console.log(
    'Sent a test code to ' + me + '. Remaining daily quota: ' + MailApp.getRemainingDailyQuota(),
  );
}
