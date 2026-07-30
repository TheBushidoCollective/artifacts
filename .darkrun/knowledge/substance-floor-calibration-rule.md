---
topic: substance-floor-calibration-rule
created_at: 2026-07-30T05:32:27.088160+00:00
updated_at: 2026-07-30T05:32:27.088160+00:00
---
How this run sets `substance-floor` quality gates on doc units, frozen at `specify` round 3 after two reviewers spent two rounds disagreeing because neither rule was written down.

**The counting rule (testability's, adopted station-wide).** Count one mandated item for every distinct thing the unit obliges the document to contain, regardless of the markup expressing it. The union of: every top-level list item under "What this document must decide", whether `- ` or `1.`; every item named in that unit's "Route to `shape`" section, counting the semicolon-separated list, since the routing criterion makes routing a required resolution; and every enumeration a numbered completion criterion requires to be complete and that is not already counted. Do **not** count "Already decided" items, which are constraints to honor rather than content to produce.

**Why a bullet-counting rule fails.** completeness's original rule counted `- ` bullets only. It agreed with the markup-based count on the two units written entirely in bullets and diverged on the one using a numbered list, undercounting `spec-service-surface` by its five numbered disclosure items plus seven route items plus a twelve-case enumeration. A rule that reads formatting rather than obligation produces a wrong answer on whichever unit happens to use a numbered list, and the error is invisible because it looks like a merely finer-grained disagreement.

**The rate.** 60 to 85 words per mandated item, observed across this run's completed artifacts. Large embedded enumerations run leaner, roughly 25 words per case.

**The placement rule.** The floor goes at or just below the band bottom, never mid-band. It is a stub guard, not a completeness signal. Completeness is carried by the numbered completion criteria, which is where a document that clears the word count while genuinely incomplete gets caught. A mid-band floor creates padding pressure, which is the opposite of what the gate is for.

**The arithmetic on record, corrected.** The four floors as shipped, against testability's bands: format 1600 against 1620 to 2295; publish 2200 against 2280 to 3230; viewer 2600 against 2580 to 3655; service 2800 against 2810 to 3835. Three of the four sit just below their band bottom and viewer sits 20 above. **All four are placed by the at-or-just-below rule.** An earlier resolution note justified service's 2800 as "inside both reviewers' bands," which is wrong: 2800 is inside completeness's 2460 to 3485 but 10 below testability's 2810. The number is right and the stated reason was not. Placing by the rule is coherent; placing by "inside both" is not, and the two rules happen to agree on three of four units, which is exactly how a wrong reason survives.

**The failure this exists to prevent.** A floor set in a unit's frontmatter gate and a different floor argued in its body prose. Only the gate runs, so the prose is decoration that misleads the worker about how much the unit actually mandates. All four `specify` units now carry the same four elements in criterion 2: the gate value, the item count under this rule, the resulting band, and an explicit statement that the floor is a stub guard and never to pad to clear it. Keep that shape at later stations, and when a floor moves, move the prose in the same edit.
