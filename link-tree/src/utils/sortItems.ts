import { Folder, Link } from "@prisma/client";

  export function sortItemsByPositionAndDate(
    items: (Link | Folder)[],
  ) {
    return (items as (Link | Folder)[]).sort((a, b) => {
      if (a.position === null && b.position !== null) return 1;
      if (a.position !== null && b.position === null) return -1;
      if (a.position === null && b.position === null) {
        return new Date(a.createAt).getTime() - new Date(b.createAt).getTime();
      }
      return (
        a.position - b.position ||
        new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
      );
    });
  }