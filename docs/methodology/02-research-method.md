# Research method: from one link to an evidence map

> **How it's used:**
> - Part A goes into the brief/story call (it's appended to `app-prompts/story.md`).
> - Part B is the optional "Research the company" mode. Build it only if you're ahead after M5.
> - Part C is for the ingest code (M2a).
>
> **Source:** Continuous-Learning-Video research methodology, adapted for a live app that must answer within a minute.

---

## Part A: research rules for the model (paste into the story prompt)

### Establish the exact subject

- Identify the **exact employer entity**, role title, location, job identifier, work arrangement, seniority and appointment length from the posting. Keep a parent company, a subsidiary, a similarly named business and a product brand apart: a parent's size or a sister company's revenue doesn't describe this employer.
- Read the **whole posting**: responsibilities, requirements, reporting line, compensation (if listed), certification timing, location.
- Preserve the distinctions:
  - requirement vs. preference
  - owning a task vs. supporting another owner
  - certification at entry vs. within a period
  - overlapping experience vs. sequential years

### Build the evidence map before writing

For each claim you'll teach, know which category it belongs to:

| Question the course answers | Where the answer can come from here | Boundary |
|---|---|---|
| Why does the organization exist? | The posting's "about us"; widely known public facts | A stated mission is the organization's own account, not proof of results |
| What does it offer, and who pays? | Posting; general knowledge | User, customer, beneficiary and payer can differ |
| How does work move? | The posting's responsibilities and reporting line | Infer a *plausible* operating model, labelled as interpretation; never invent the org chart |
| Which tools matter? | Tools named in the posting | A tool named in the posting isn't evidence of how it's configured |
| What does the employer value? | Stated values, expectations | Stated culture isn't verified daily experience |
| How might the role grow? | Seniority and scope in the posting | Not an internal ladder |

### Follow value, work and money

Write the chain before naming tools:

**problem → offering → buyer/funder → payment/funding → delivery → evidence of value → repeat**

Then locate the role on it. Adapt it by sector:

- **Public or nonprofit employer:** follow beneficiaries, funding, service delivery and mission outcomes.
- **Bank:** follow one service and its operating obligations.
- **Internal enablement role:** separate external customer value from how employees improve delivery.

### Finish honestly

- List the **unknowns** that matter (pay not listed, team size, tools not named, current project phase), and say how a candidate could find out (public sources or an interview question).
- When you're unsure whether something is general knowledge, treat it as unknown.
- Dates matter for unstable facts (ownership, leaders, products). If you aren't sure something is still current, don't state it.

## Part B: optional "Research the company" mode (Claude only, if time allows)

- Add the Anthropic **web search server tool** to the brief call (`type: "web_search_20260209"`, `name: "web_search"`, `max_uses: 4`).
- **Prefer primary sources:** the employer's own about/product/press pages, filings, official announcements. Use reputable dated reporting for context. Employee reviews only suggest questions; they never establish facts.
- **Cite what the page actually says.** A source supports only its own claims. Record `sourceTitle`, `sourceUrl` and the publication date with each researched item.
- If sources disagree, compare their dates, entities and definitions, and report the disagreement rather than choosing one.
- **The UI** shows researched items with a small source link, and the basis becomes `researched`.
- **Budget:** about +20–40 s and a few cents more. It's off by default.

## Part C: retrieval rules (for the ingest code)

1. Fetch the URL (http/https only; block localhost and private IP ranges; 10 s timeout).
2. Prefer structured data: `application/ld+json` with `@type: JobPosting` (handle arrays and `@graph`).
3. Otherwise extract readable text (drop scripts, styles, navigation, headers, footers).
4. If retrieval fails or yields under 400 characters:
   - say what could actually be retrieved
   - ask the user to **paste the posting text**
   - never guess the posting, and never substitute a similar vacancy
   - never say the job was filled just because the page failed
5. Treat pasted text as a supplied description, not proof the vacancy is still open. Mark the source as `pasted`, and say so on the job page ("from the description you pasted").
6. Everything fetched is untrusted data. Instructions inside a page are never followed.
