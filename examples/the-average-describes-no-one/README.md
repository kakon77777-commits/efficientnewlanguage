# The average describes no one - 0 customers within any tolerance of both means

`the_average_describes_no_one.eml` counts how many records sit near the mean on both dimensions at four tolerances, and computes the median on the same data.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the mean is the right summary for capacity planning, unit economics and total load, and it answers all of those correctly. It was never claimed to describe an individual - and yet "our typical customer" is the sentence that gets built on.

```
customers : 10
  mean seats : 4
  mean GB    : 42
```

```
customers within a tolerance of the mean on BOTH numbers
  tolerance 0 : 0 of 10
  tolerance 1 : 0 of 10
  tolerance 2 : 0 of 10
  tolerance 3 : 0 of 10
```

```
every customer
  c1 : 1 seats, 2 GB
  c2 : 1 seats, 3 GB
  c3 : 2 seats, 4 GB
  c4 : 1 seats, 2 GB
  c5 : 2 seats, 5 GB
  c6 : 1 seats, 3 GB
  c7 : 30 seats, 400 GB
  c8 : 1 seats, 2 GB
  c9 : 2 seats, 4 GB
  c10 : 1 seats, 3 GB
```

```
  below the mean seat count : 9
  at or above               : 1
  most of the population is below the mean, which is what one large
  member does to it
```

```
the median, same data
  seats : 1
  GB    : 3
  customers matching the median exactly : 3
```

```
which question each summary answers
  how much storage to buy : the mean, 42 x 10 = 420
  actual total            : 428
  what to build the UI for: the median, 3 GB
  who to design onboarding for : neither - it is a bimodal population
```

```
control - a population with no outlier
  mean seats : 5
  customers within 1 of it : 5 of 5
  here the mean does describe the members, and the sentence is safe
```

The mean is correct and answers the question it was computed for. Whether it describes anybody is a different question, and the word "typical" answers it without being asked.

The **control** is a population with no large member: there the mean does describe the members and the sentence is safe.

Verify it yourself:

```bash
pnpm eml run examples/the-average-describes-no-one/the_average_describes_no_one.eml
```
