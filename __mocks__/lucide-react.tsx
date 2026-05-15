/**
 * Manual mock for lucide-react.
 * Returns a lightweight SVG stub for every named icon export so tests do not
 * need to render real SVG trees.
 *
 * Usage: icons render as <svg data-testid="icon-{name}" />
 *   e.g. <ArrowRight /> → <svg data-testid="icon-ArrowRight" />
 */
import React from "react";

type IconProps = {
  className?: string;
  size?: number | string;
  "data-testid"?: string;
};

const createIconMock = (name: string) =>
  jest.fn(({ "data-testid": testId, ...rest }: IconProps = {}) =>
    React.createElement("svg", {
      "data-testid": testId ?? `icon-${name}`,
      "aria-hidden": true,
      ...rest,
    }),
  );

// Export every icon used in the project
export const ArrowRight = createIconMock("ArrowRight");
export const Bookmark = createIconMock("Bookmark");
export const CheckCircle2 = createIconMock("CheckCircle2");
export const ChevronDown = createIconMock("ChevronDown");
export const Globe = createIconMock("Globe");
export const Shield = createIconMock("Shield");
export const ShieldCheck = createIconMock("ShieldCheck");
export const Loader2 = createIconMock("Loader2");
export const AlertCircle = createIconMock("AlertCircle");
export const X = createIconMock("X");
export const ChevronUp = createIconMock("ChevronUp");
export const ArrowLeft = createIconMock("ArrowLeft");
export const Check = createIconMock("Check");
export const Info = createIconMock("Info");
// StepPersonal icons
export const Building2 = createIconMock("Building2");
export const Calendar = createIconMock("Calendar");
export const IdCard = createIconMock("IdCard");
export const Mail = createIconMock("Mail");
export const Map = createIconMock("Map");
export const MapPin = createIconMock("MapPin");
export const Phone = createIconMock("Phone");
export const User = createIconMock("User");
export const Users = createIconMock("Users");
// StepFamily icons
export const Banknote = createIconMock("Banknote");
export const Briefcase = createIconMock("Briefcase");
export const Heart = createIconMock("Heart");
export const Home = createIconMock("Home");
// StepSituation icons
export const AlignLeft = createIconMock("AlignLeft");
export const Sparkles = createIconMock("Sparkles");

// Catch-all proxy so any icon not listed above still renders without error
const handler: ProxyHandler<object> = {
  get(_target, prop: string) {
    return createIconMock(prop);
  },
};

export default new Proxy({}, handler);
