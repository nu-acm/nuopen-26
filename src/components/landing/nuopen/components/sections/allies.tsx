import './allies.css';

export function Allies() {
  return (
    <section id="allies" aria-labelledby="allies-title" className="section allies">
      <h2 id="allies-title" className="h2 font-display">
        Thank you for supporting NU Open
      </h2>
      <ul className="allies-logos">
        <li className="allies-logo">
          <img
            src="/nuopen/partners/freedom.svg"
            alt="Freedom"
            width={1520}
            height={356}
            loading="lazy"
          />
        </li>
        <li className="allies-logo">
          <img
            src="/nuopen/partners/nu-impact-foundation.png"
            alt="NU Impact Foundation"
            width={960}
            height={178}
            loading="lazy"
          />
        </li>
      </ul>
    </section>
  );
}
