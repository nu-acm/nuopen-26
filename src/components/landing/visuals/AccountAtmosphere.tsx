/** Decorative flybys remain outside the forms and use only compositor transforms. */
export function AccountAtmosphere() {
  return (
    <div className="account-atmosphere" aria-hidden="true">
      <div className="account-flyby account-flyby--tie">
        <svg viewBox="0 0 150 80" fill="none" stroke="currentColor">
          <path d="m24 5 20 12v46L24 75 5 62V18Zm102 0 19 13v44l-19 13-20-12V17ZM24 5v70m102-70v70M44 40h62" />
          <circle cx="75" cy="40" r="16" />
          <circle cx="75" cy="40" r="8" />
          <path d="M64 29l22 22m0-22L64 51M8 20l32 40M8 60l32-40m70 0 32 40m0-40-32 40" />
        </svg>
        <i className="account-laser" />
      </div>
      <div className="account-flyby account-flyby--xwing">
        <svg viewBox="0 0 150 90" fill="none" stroke="currentColor">
          <path d="m75 7 9 40-9 34-9-34ZM66 40 20 9l-6 8 51 35m19-12 46-31 6 8-51 35M66 50 20 81l-6-8 51-35m19 12 46 31 6-8-51-35M14 5v20m122-20v20M14 65v20m122-20v20" />
          <path d="M67 64h16m-11-5h6" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}
