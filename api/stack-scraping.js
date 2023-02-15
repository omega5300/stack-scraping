import axios from 'axios'
import { load } from 'cheerio'

const handler = async (req, res) => {
  const { website, opt } = req.query

  try {
    const { data } = await axios.get(website)

    const $ = load(data)

    const scraping = {
      title() { return $('title').text() },
      images() {
        const imagesList = $('img').map((i, el) => ({
          imageURL: $(el).attr('src'),
          imageTitle: $(el).attr('alt')
        })).toArray()

        return imagesList.length === 0
          ? 'no found images'
          : imagesList
      },
      metadata() {
        const metadataList = $("meta").map((i, el) => ({
          metaType: $(el).attr("name"),
          metaValue: $(el).attr("content")
        })).toArray()
          .filter((data) => data?.metaType)

        return metadataList
      },
      headings() {
        const headingList = $("h1, h2, h3, h4, h5, h6").map((i, el) => ({
          headingTag: $(el).prop("tagName"),
          headingText: $(el).text()
        })).toArray()

        return headingList.length === 0 ? '' : headingList
      },
      tableHead() {
        const tableHeadList = $("th").map((i, el) => ({
          thCol: $(el).index(),
          thData: $(el).text()
        })).toArray()

        return tableHeadList.length === 0
          ? "no found th tags"
          : tableHeadList
      },
      tableData() {
        const tableColumnList = $("td").map((i, el) => ({
          rowID: $(el).parent().index(),
          colID: $(el).index(),
          colData: $(el).text(),
        })).toArray();

        return tableColumnList.length === 0
          ? "no found td tags"
          : tableColumnList
      },
      links() {
        const linkList = $("a").map((i, el) => ({
          linkPath: $(el).attr("href"),
          LinkText: $(el).text()
        })).toArray()
          .filter(({ linkPath }) => linkPath?.indexOf("#") !== 0);

        return linkList;
      },
      cites() {
        const citeList = $("q, blockquote").map((i, el) => ({
          citeTag: $(el).prop('tagName'),
          citeLink: $(el).attr('cite'),
          citeText: $(el).text()
        })).toArray();

        return citeList.length === 0
          ? "no found q and/or blockquote tags"
          : citeList;
      }
    }

    /* return scraping[opt]() */
    typeof scraping[opt]() === 'string' 
      ? res.send(scraping[opt]()) 
      : res.json(scraping[opt]()) 
  } catch (err) {
    res.send(err.message)
  }
}

export default handler
