import { FullSlug, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

/**
 * Natural sort comparison that treats numbers within strings as numeric values.
 * This ensures "Chapter 2" comes before "Chapter 10" instead of "Chapter 10" < "Chapter 2".
 */
function naturalCompare(a: string, b: string): number {
  const splitA = a.match(/(\d+|\D+)/g) || []
  const splitB = b.match(/(\d+|\D+)/g) || []
  
  const minLength = Math.min(splitA.length, splitB.length)
  
  for (let i = 0; i < minLength; i++) {
    const aPart = splitA[i]
    const bPart = splitB[i]
    const aIsNum = /^\d+$/.test(aPart)
    const bIsNum = /^\d+$/.test(bPart)
    
    if (aIsNum && bIsNum) {
      // Both are numbers, compare numerically
      const numA = parseInt(aPart, 10)
      const numB = parseInt(bPart, 10)
      if (numA !== numB) {
        return numA - numB
      }
    } else if (aIsNum || bIsNum) {
      // One is a number, numbers come before text
      return aIsNum ? -1 : 1
    } else {
      // Both are text, compare alphabetically
      const compare = aPart.localeCompare(bPart)
      if (compare !== 0) {
        return compare
      }
    }
  }
  
  // If one string is a prefix of the other, shorter comes first
  return splitA.length - splitB.length
}

export function byDateAndAlphabetical(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      const dateDiff = getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
      if (dateDiff !== 0) return dateDiff
      // If dates are equal, fall through to natural sort by title
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort naturally by title (treats numbers as numbers)
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return naturalCompare(f1Title, f2Title)
  }
}

export function byDateAndAlphabeticalFolderFirst(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort folders first
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    // If both are folders or both are files, sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      const dateDiff = getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
      if (dateDiff !== 0) return dateDiff
      // If dates are equal, fall through to natural sort by title
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort naturally by title (treats numbers as numbers)
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return naturalCompare(f1Title, f2Title)
  }
}

type Props = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

export const PageList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst(cfg)
  let list = allFiles.sort(sorter)
  if (limit) {
    list = list.slice(0, limit)
  }

  return (
    <ul class="section-ul">
      {list.map((page) => {
        const title = page.frontmatter?.title
        const tags = page.frontmatter?.tags ?? []

        return (
          <li class="section-li">
            <div class="section">
              <p class="meta">
                {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
              </p>
              <div class="desc">
                <h3>
                  <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                    {title}
                  </a>
                </h3>
              </div>
              <ul class="tags">
                {tags.map((tag) => (
                  <li>
                    <a
                      class="internal tag-link"
                      href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

PageList.css = `
.section h3 {
  margin: 0;
}

.section > .tags {
  margin: 0;
}
`
