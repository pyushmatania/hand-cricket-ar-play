// IPL Team Star Player Card Art — 3D Stylized Characters
import cskStar from './csk-star.png';
import miStar from './mi-star.png';
import rcbStar from './rcb-star.png';
import kkrStar from './kkr-star.png';
import dcStar from './dc-star.png';
import srhStar from './srh-star.png';
import rrStar from './rr-star.png';
import pbksStar from './pbks-star.png';
import gtStar from './gt-star.png';
import lsgStar from './lsg-star.png';

// Bowler / All-rounder alternate poses
import cskBowler from './csk-bowler.png';
import miBowler from './mi-bowler.png';
import rcbAllrounder from './rcb-allrounder.png';
import kkrBowler from './kkr-bowler.png';
import dcAllrounder from './dc-allrounder.png';
import srhBowler from './srh-bowler.png';
import rrBowler from './rr-bowler.png';
import pbksAllrounder from './pbks-allrounder.png';
import gtBowler from './gt-bowler.png';
import lsgAllrounder from './lsg-allrounder.png';

export const TEAM_STAR_ART: Record<string, string> = {
  csk: cskStar,
  mi: miStar,
  rcb: rcbStar,
  kkr: kkrStar,
  dc: dcStar,
  srh: srhStar,
  rr: rrStar,
  pbks: pbksStar,
  gt: gtStar,
  lsg: lsgStar,
};

export const TEAM_BOWLER_ART: Record<string, string> = {
  csk: cskBowler,
  mi: miBowler,
  rcb: rcbAllrounder,
  kkr: kkrBowler,
  dc: dcAllrounder,
  srh: srhBowler,
  rr: rrBowler,
  pbks: pbksAllrounder,
  gt: gtBowler,
  lsg: lsgAllrounder,
};

export { cskStar, miStar, rcbStar, kkrStar, dcStar, srhStar, rrStar, pbksStar, gtStar, lsgStar };
export { cskBowler, miBowler, rcbAllrounder, kkrBowler, dcAllrounder, srhBowler, rrBowler, pbksAllrounder, gtBowler, lsgAllrounder };
