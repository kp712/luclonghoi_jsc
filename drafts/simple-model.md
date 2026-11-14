# The simple model (draft)

Every rotation gets 4 star ratings, 1 to 5. More stars = better.
3 rice crops is the yardstick. Everything is compared with it.

## Step 1. Water: "Does it use less canal water?"
Look at how much water the rotation saves compared with 3 rice crops.

| Saves | Stars |
|---|---|
| nothing | 1 |
| a quarter | 2 |
| half | 3 |
| three quarters | 4 |
| all of it | 5 |

Formula: 1 + 4 × (share saved)

## Step 2. Income: "Does it earn more than 3 rice crops?"

| Yearly profit | Stars |
|---|---|
| half of 3 rice | 1 |
| same as 3 rice | 3 |
| double 3 rice | 5 |

Profit per crop = the middle (median) of the published figures.

## Step 3. Soil: "Does the land get a break from rice?"
Start with 2 stars, then:
- +1 if the land rests for a month or more
- +1 if a non-rice crop is grown
- +1 if a legume (mung bean) is grown
- -1 if there is a shrimp season (salt stays in the soil)

Stay between 1 and 5.

## Step 4. Salt: "Is a crop in the field when the water is salty?"
Count the pin's salty months. What share of them have a crop growing?
- No crop in any salty month: 5 stars
- A crop in every salty month: 1 star

Formula: 5 - 4 × (share of salty months with a crop)

## Step 5. The final score
Average the 4 stars, using the user's sliders as weights.
All sliders at zero means a plain average. The highest average is ranked first.

## What is not in it
Heat days, canal water inside the salt score, the El Niño view, loss shares,
cover crops, the labour deduction and computed confidence levels.
Replaced by one honest line: "an estimate, not a forecast".
