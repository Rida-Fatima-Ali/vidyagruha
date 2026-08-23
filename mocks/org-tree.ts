import { MOCK_ADMIN_DASHBOARD } from "@/mocks/admin";
import { GROUP_SLUGS, getRoster, groupLabel } from "@/mocks/roster";
import type { OrgNode } from "@/types/org";

/**
 * The institutional tree a notice is addressed to: Institution → Department →
 * Year → Division. Head counts come from the same department + roster stores
 * the rest of the demo reads, so the reach preview never disagrees with the
 * numbers shown elsewhere.
 */

const INSTITUTION = "K. J. Somaiya Institute of Technology";

/** Share of a department's students sitting in each year. */
const YEAR_SPLIT: { key: string; label: string; share: number }[] = [
  { key: "fe", label: "First Year", share: 0.29 },
  { key: "se", label: "Second Year", share: 0.26 },
  { key: "te", label: "Third Year", share: 0.23 },
  { key: "be", label: "Final Year", share: 0.22 },
];

/** Second-year Computer Engineering is the fully-modelled branch (Sem 3). */
const MODELLED_DEPARTMENT = "cmpn";
const MODELLED_YEAR = "se";

function divisionsFor(
  departmentId: string,
  yearKey: string,
  yearStudents: number,
  yearFaculty: number,
): OrgNode[] {
  if (departmentId === MODELLED_DEPARTMENT && yearKey === MODELLED_YEAR) {
    return GROUP_SLUGS.map((slug) => ({
      id: `${departmentId}-${yearKey}-${slug}`,
      label: groupLabel(slug),
      kind: "division" as const,
      students: getRoster(slug).length,
      faculty: Math.max(1, Math.round(yearFaculty / GROUP_SLUGS.length)),
    }));
  }
  return ["A", "B"].map((letter, index) => ({
    id: `${departmentId}-${yearKey}-div-${letter.toLowerCase()}`,
    label: `Division ${letter}`,
    kind: "division" as const,
    students:
      index === 0 ? Math.ceil(yearStudents / 2) : Math.floor(yearStudents / 2),
    faculty: Math.max(1, Math.round(yearFaculty / 2)),
  }));
}

export function buildOrgTree(): OrgNode {
  const departments: OrgNode[] = MOCK_ADMIN_DASHBOARD.departments.map((department) => {
    const years: OrgNode[] = YEAR_SPLIT.map((year) => {
      const yearStudents = Math.round(department.students * year.share);
      const yearFaculty = Math.max(1, Math.round(department.faculty * year.share));
      const divisions = divisionsFor(department.id, year.key, yearStudents, yearFaculty);
      return {
        id: `${department.id}-${year.key}`,
        label: year.label,
        kind: "year" as const,
        students: divisions.reduce((sum, division) => sum + division.students, 0),
        faculty: yearFaculty,
        children: divisions,
      };
    });

    return {
      id: department.id,
      label: department.name,
      kind: "department" as const,
      code: department.code,
      students: years.reduce((sum, year) => sum + year.students, 0),
      faculty: department.faculty,
      children: years,
    };
  });

  return {
    id: "institution",
    label: INSTITUTION,
    kind: "institution",
    students: departments.reduce((sum, department) => sum + department.students, 0),
    faculty: departments.reduce((sum, department) => sum + department.faculty, 0),
    children: departments,
  };
}
