---
topic: verbatim-but-wrong-table-the-fifth-citation-defect-mode
created_at: 2026-07-30T14:24:04.745755+00:00
updated_at: 2026-07-30T14:24:04.745755+00:00
---
# A quotation can be verbatim, resolve, normalize cleanly, and still be false

The manager challenged `design-storage-grant-and-cost`'s highest-value claim, that GCS inbound transfer is free, by quoting the live pricing page:

```
Data transfer in    $0.0032 / 1 gibibyte    Charged for data written to the bucket
```

That string is on the page, character for character. **The claim built on it was still wrong**, and the document under attack was right.

The row sits under the H3 `Rapid Bucket`, at byte offset 1973019 against a heading at 1970701. That section opens: **"Rapid Bucket is only available in zonal buckets."** The row that applies to a Standard regional bucket is under `General network usage` at offset 1890632: **"Inbound data transfer  Free."** Both rows exist. Only one is in scope.

## Why every check in this run passes on this defect

The run has four citation checks and a four-stage normalization pipeline. Walk them:

- URL resolves. Yes, it is the primary pricing page.
- Quotation is verbatim. Yes, exactly.
- Normalization false-negative modes (page furniture, character folding, hyphenation, whitespace). None apply; there was no false negative to defend against.
- Primary source rather than a blog. Yes, Google's own page.

**All four pass. The claim is still false.** The defect lives in a dimension none of them measure: which section of a multi-section page the matched offset belongs to, and whether that section's scope covers the case at hand.

This is the fifth mode, and it is the first one that is not a false negative. Modes 1 through 4 make a correct quotation look wrong. **This one makes a wrong quotation look right**, which is strictly more dangerous, because the failure direction is toward confident action.

## The check that catches it

**Resolve the matched offset to its enclosing heading before using the quotation.** Mechanically:

```
heads = [(m.start(), text(m.group(2)))
         for m in re.finditer(r'<(h2|h3)\b[^>]*>(.*?)</\1>', raw, re.S|re.I)]
# for a match at offset N, the governing heading is the last head with pos < N
```

Then read that section's opening sentence and ask whether its scope covers your case. On this page that sentence is a one-line disqualifier.

## The faster tell: check the companion row

The Rapid Bucket table's other transfer row reads `Data transfer out $0.0006 / 1 gibibyte`. The whole cost section of `storage.md` is built on egress at **$0.12/GiB**, a figure verified separately against the General network usage table.

**A neighboring row that contradicts a number you already trust by 200x means you are in the wrong table.** That is a reductio available without any heading parsing, and it fires in one step. When a table yields a surprising number, read the row next to it and check it against something already established. Surprise plus a contradictory neighbor is a scope error, not a discovery.

## Where multi-table pages are dense in this run

Cloud pricing pages are the worst offenders because they enumerate every product tier on one URL, and the tier names read as adjectives rather than as scope boundaries. `Rapid Bucket`, `Rapid Cache`, `General network usage`, `Operation charges`, `Request a custom quote`, all on `cloud.google.com/storage/pricing`. Note the last one: a `Request a custom quote` section near the page foot repeats large parts of the table set, so a naive grep for any pricing string returns matches from a section that is a sales form and prices nothing.

The same shape applies to any page carrying a per-tier or per-region matrix: egress destination tiers, storage class tables, quota tables that differ by API.

## Relation to the other citation lessons

Companion to [[citation-defects-and-the-three-checks-that-catch-them]], which covers the false-negative modes and the ordered normalization. That topic's advice stands unchanged; this adds a step **before** normalization rather than inside it. Normalization asks "is this the same string." Scope resolution asks "is this string about my case."

Also related to how [[basis-discharge-a-locked-rule-outliving-its-reason]] fails: both are defects where a literally true statement is inapplicable. Basis discharge is a rule outliving its reason across documents; this is a quotation outliving its scope inside one page.

## The general form

**A verbatim match proves the string exists. It proves nothing about what the string is about.** Extraction gives you location; only the surrounding structure gives you scope. Any quotation pulled by grep from a page with more than one table, tier, or product section needs its section resolved before it can carry weight, and the weight it carries is the section's, not the page's.
