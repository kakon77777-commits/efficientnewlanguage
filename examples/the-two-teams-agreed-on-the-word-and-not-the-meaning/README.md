# The two teams agreed on the word and not the meaning

`the_two_teams_agreed_on_the_word_and_not_the_meaning.eml` - Two teams report active users. The growth team says 42000, the platform team says 18000. Both queries are correct and the numbers they produce are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Each definition was chosen with care and each is right for its own purpose. The growth team counts a login inside 30 days, because a login is what a marketing campaign can move and it is the number that tells them whether a campaign worked. The platform team counts a write action inside 30 days, because a write is what consumes storage and generates load, and it is the number that tells them what to provision. Neither team could use the other's definition without the metric ceasing to answer their question.

The two definitions were both written down. What was never written down is that there are two, so both appear in tables headed "active users", and every reader who joins them is joining columns that do not share a population.

A ratio between two definitions of one word is arithmetic on two different sets, and it produces a number that looks exactly like the metric it is not.

```
registered users                    : 100000
growth team, logged in within 30d   : 42000 (42 percent)
platform team, wrote within 30d     : 18000 (18 percent)
both tables are headed 'active users'
```

```
  ratio between the two             : 233 hundredths
  writers are a subset of logins, so neither number is wrong
```

```
revenue per active user, from the same revenue figure
  using the growth definition   : 20
  using the platform definition : 46
  difference                    : 26, a factor of 230 hundredths
```

```
  the pricing model used one
  the board deck used the other
  both cite the same revenue and the same word
```

```
conversion rate among active users
  numerator and denominator both growth   : 9000 / 42000 = 21 percent
  numerator and denominator both platform : 7200 / 18000 = 40 percent
  numerator platform, denominator growth  : 7200 / 42000 = 17 percent
```

```
  three numbers, all labelled 'active conversion rate'
  the widest pair differ by 23 points
  the mixed one is the only one that is wrong, and it is the one a
  spreadsheet produces when two teams paste into adjacent columns
```

```
what each team sees when it checks its own number
  growth team re-runs its query   : 42000, matches its own report
  platform team re-runs its query : 18000, matches its own report
  each team's number is reproducible, stable and documented
  a disagreement needs someone holding BOTH definitions at once
  and the definitions live in two repositories
```

```
control - each query against its own written definition
  growth: count users with a login event in the last 30 days
    stated definition matched : yes
    off-by-one on the window  : no
  platform: count users with a write event in the last 30 days
    stated definition matched : yes
    off-by-one on the window  : no
  incorrect queries found : 0 of 2
```

```
  a review of either query approves it
  the defect is the word, and a word is not in either repository
```

```
null control - the same two definitions where every login writes
  growth definition selects   : 42000
  platform definition selects : 42000
  difference                  : 0
  revenue per active user, either way : 20
  same ambiguity, same two repositories, and no consequence
  the cost is exactly the size of the gap between the two populations
```

```
a word used as a metric name
  is each definition correct       yes, for its own question
  is each query correct            yes, against its own definition
  do the two select the same set   this is the question nobody owns
  a shared name is a shared claim, and nobody made it deliberately
```

```
the fix is not to pick a winner
both questions are real, so both metrics should exist under DIFFERENT names
```

A login is what a campaign can move and a write is what consumes storage, so neither team can adopt the other's definition without losing the answer they need. Both wrote their definition down. Neither wrote down that there are two. Revenue per active user is 20 or 46 depending on which table you read, and the conversion rate is 17, 21 or 40 percent depending on which halves you join.

Verify it yourself:

```bash
pnpm eml run examples/the-two-teams-agreed-on-the-word-and-not-the-meaning/the_two_teams_agreed_on_the_word_and_not_the_meaning.eml
```
