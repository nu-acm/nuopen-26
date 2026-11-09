import { NavigationJump } from './navigation-jump';
import { SaberProgress } from './saber-progress';
import { SaberTrail } from './saber-trail';
import { Soundtrack } from './soundtrack';
import { SideSync } from './use-side';

/** The shared root stays mounted during navigation, preserving the score and side. */
export function SiteExperience() {
  return (
    <>
      <SideSync />
      <SaberProgress />
      <SaberTrail />
      <Soundtrack />
      <NavigationJump />
    </>
  );
}
