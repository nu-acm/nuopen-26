/** A brief opacity reveal keeps the pilot's actual name readable throughout. */
export function PilotName({ name }: { name: string }) {
  return <span className="pilot-name">{name}.</span>;
}
