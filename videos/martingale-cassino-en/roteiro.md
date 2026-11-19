# VORTTUM 001 (EN-US) | I Tried to Beat a Casino With Math. Did It Work?

Format: YouTube 16:9 (1920x1080). Voice: en-US-AndrewMultilingualNeural, +0%.
Currency: US dollars. Same rules and same numbers as the Portuguese script (simulacao.py, seed 2026).

## Numbers checked in code

- Red: 18/37 = 48.65%. Lose: 19/37 = 51.35%.
- 4-round Martingale: lose 10 + 20 + 40 = 70, win 80, profit 10.
- 8 losses in a row: cumulative loss 2,550; next bet 2,560. Then 5,120 and 10,240.
- Losses survived (first bet 10, doubling): $1,000 = 6; $10,000 = 9; $100,000 = 13.
- Expected value of a $10 bet on red: (18/37)·10 − (19/37)·10 = −10/37 = −$0.27 (2.70% of the amount bet).
- Simulation (seed 2026, 1,000,000 spins, bankroll 10,000, first bet 10, no table limit):
  - Spin 1: 7 (red, win, balance 10,010). Spin 2: 20 (black, loss). Spin 3: 32 (red, win with 20, balance 10,020).
  - Spins 10 to 14: five losses in a row (10, 20, 40, 80, 160); spin 14 was the zero. Spin 15: win with 320, balance 10,060.
  - Session 1: 6,181 spins, peak balance 39,960. Ended with 11 losses in a row (10 up to 10,240, total 20,470): 19,490 left, next bet 20,480. Session result: +9,490.
  - Worst streak: session 323, 39,800 spins, peak balance 203,440. Fourteen losses in a row (10 up to 81,920), 163,830 lost at once. Ended at 39,610 (+29,610).
  - 488 sessions; 487 ended for lack of money; the last one was cut off at spin 1,000,000 with +2,280.
  - Aggregate result: −$2,164,630. Total wagered: $59,924,790 (loss of 3.61% of the amount bet).
  - Expected by the math: −$1,619,589 (2.70%). Difference of 1.4 standard deviations: normal sample variation.
  - 486,539 winning sequences (99.9%), +$4,865,390 in total. 487 busts, −$7,030,010 (14,435 on average).
  - Sessions that ended: 52 with a profit, 435 with a loss.
  - Whole experiment repeated with seeds 1 to 100: average loss 2.72% of the amount bet; worst −4.11%; best +4.47%; 1 out of 100 ended with a profit.

---

### A01 | The hook
Screen: black for a split second; editorial European roulette on aged paper. A $10 chip lands on red, disappears; $20, $40, $80 appear. In the first 10 s: a sequence that ends in a win (+10), then right away a losing streak where the bet explodes.

**Fala 1:** I found a strategy that wins ten dollars almost every single time it works. The problem is, when it fails, you can lose thousands.

**Fala 2:** So I decided to test this strategy over one million spins of a roulette wheel. And the result reveals something really strange about the math of money.

**Fala 3:** Here's how it works. You bet ten dollars on red. If you win, you keep ten dollars of profit.

**Fala 4:** If you lose, you double your bet. Lost again? Double it again. And you keep going until you win.

**Fala 5:** When you finally hit, you get back everything you lost, and you still walk away with ten dollars of profit. Sounds simple.

**Fala 6:** But can you really beat a casino this way?

### A02 | The strategy that looks unbeatable
Screen: simplified roulette table; $1,000 bankroll (only to explain). Rounds: 10 loss, 20 loss, 40 loss, 80 win; balance after each round (990, 970, 930, 1,010).

**Fala 1:** Let's see why this strategy looks so good. Imagine you have a thousand dollars.

**Fala 2:** You start by betting ten dollars on red. The wheel spins. It lands on black. You lost ten dollars.

**Fala 3:** Now, instead of betting another ten, you bet twenty. The wheel spins again. Black. Another loss.

**Fala 4:** So far, you've lost thirty dollars. In the third round, you bet forty. And you lose again.

**Fala 5:** Now you're down seventy dollars. But in the fourth round, you bet eighty. And this time, you win.

**Fala 6:** Since the bet pays one to one, you make eighty dollars of profit on that round. Take away the seventy you had lost, and you're left with exactly ten dollars.

**Fala 7:** See what just happened? You lost three times in a row. But a single win was enough to get it all back. And you still ended up with a profit.

**Fala 8:** This strategy has a name: the Martingale. It's been around for centuries. And there's a reason it keeps attracting so many people.

**Fala 9:** When you only look at a few betting sequences, it really does seem to work. After all, you don't need to win many times. You just need to win once before you run out of money.

**Fala 10:** And that raises an interesting question. If a single win can recover every loss that came before it, why didn't casinos go broke a long time ago?

### A03 | The detail almost nobody notices
Screen: European roulette from above; separate 18 red, 18 black and 1 green; probability bar 48.65% vs 51.35%.

**Fala 1:** To answer that, we need to look at something that seems insignificant. A European roulette wheel has thirty-seven pockets.

**Fala 2:** Eighteen are red. Eighteen are black. And one is green. The zero.

**Fala 3:** When you bet on red, you win if the ball lands in one of the eighteen red pockets. But you lose if it lands in any of the other nineteen.

**Fala 4:** That means your chance of winning is a little less than fifty percent. More precisely, about forty-eight point six five percent.

**Fala 5:** And your chance of losing is about fifty-one point three five percent. It looks like a small difference. And it really is.

**Fala 6:** But there's a feature of mathematics that makes small differences very important when we repeat an experiment thousands of times.

**Fala 7:** Before we get there, though, we need to figure out something else. How much money would you need to survive a really bad streak?

### A04 | The price of a bad streak
Screen: geometric progression in Manim: 10, 20, 40, 80, 160, 320, 640, 1,280, 2,560, each value born from the previous one "×2"; cumulative loss column next to it (10, 30, 70, ..., 2,550). Then 5,120 and 10,240.

**Fala 1:** Let's say you start by betting ten dollars. If you lose, you need to bet twenty. Then forty. Then eighty.

**Fala 2:** One hundred sixty. Three hundred twenty. Six hundred forty. Twelve hundred eighty. And then twenty-five hundred sixty.

**Fala 3:** Look at the size of that last bet. You started out trying to win ten dollars.

**Fala 4:** And now you have to risk more than twenty-five hundred dollars just to get back what you lost and win the same ten dollars.

**Fala 5:** If you lose eight times in a row, you'll be down twenty-five hundred fifty dollars. And your next bet will have to be twenty-five hundred sixty.

**Fala 6:** But what if you lose again? The next bet would be fifty-one hundred twenty dollars. And after that, ten thousand two hundred forty.

**Fala 7:** This is a geometric progression. With every loss, the money you need doubles.

**Fala 8:** And here's the first big problem. Your money is limited. But the size of the next bet grows very quickly.

**Fala 9:** And that creates a strange situation. You can win ten dollars dozens of times. But a single bad streak can wipe out most of what you've won.

**Fala 10:** Now, maybe you're thinking of a way out. What if the person has a lot of money? Would a big enough bankroll solve this problem?

### A05 | What if I had a hundred thousand dollars?
Screen: three discreet horizontal bars ($1,000, $10,000, $100,000) and, next to each, the losses survived (6, 9, 13).

**Fala 1:** Let's test that idea. First, a bankroll of one thousand dollars.

**Fala 2:** Starting at ten dollars and doubling after every loss, you can survive six losses in a row. After that, you don't have enough money to place the next bet.

**Fala 3:** Now let's raise the bankroll to ten thousand dollars. Ten times more money. How many losses can we survive?

**Fala 4:** Nine. The bankroll got ten times bigger. But our endurance only went up by three rounds.

**Fala 5:** Now let's go to one hundred thousand dollars. Ten times more again. With that amount, we can survive thirteen losses in a row.

**Fala 6:** See the problem? The money you need grows much faster than the number of losses you can survive.

**Fala 7:** And there's also a practical limit. Many casinos set a maximum amount for each bet.

**Fala 8:** So even if you have a lot of money, you may reach a point where you just can't keep doubling. But let's set that limit aside.

**Fala 9:** Let's imagine a virtual roulette wheel, with no maximum imposed by the casino. And let's find out what happens when this strategy is tested over and over.

**Fala 10:** Not ten times. Not a hundred. Let's simulate one million spins.

### A06 | The experiment: the first spins
Screen: simplified roulette (Remotion) spinning at normal speed; parameter panel (bankroll 10,000, bet 10, Martingale, European, no limit); strip with the real first spins (number, bet, balance).

**Fala 1:** Now let's put the strategy to the test. We built a virtual roulette wheel with the same odds as a European wheel. Eighteen red pockets. Eighteen black. And the zero.

**Fala 2:** We start with ten thousand dollars. Our first bet is ten dollars. When we win, we go back to betting ten. When we lose, we double.

**Fala 3:** And if we ever reach a point where we don't have enough money to keep going, that session is over. Then we start a new session under the same conditions.

**Fala 4:** We'll repeat this process until we reach one million spins. First, let's follow a few rounds.

**Fala 5:** On the first spin, the ball landed on seven. Red. We won ten dollars.

**Fala 6:** On the second, it landed on twenty, which is black. We lost, and the bet doubled to twenty. On the third, red again, and the balance went up to ten thousand twenty.

**Fala 7:** From the tenth to the fourteenth spin, we lost five times in a row. And the last of those losses was the zero itself.

**Fala 8:** The bet reached three hundred twenty dollars. We won, and the balance went to ten thousand sixty.

### A07 | The experiment: one million spins
Screen: balance chart of session 1 (Manim), first at normal speed and then speeding up; mark the winning runs and the dips; the bust of session 1; the bust of session 323; aggregate score; distribution (bar of +4,865,390 against −7,030,010; histogram of session results).

**Fala 1:** Look at how the balance behaves. Over and over, we get small wins in a row.

**Fala 2:** When a loss shows up, we raise the bet. And very often, the next win recovers the loss. That's exactly what makes this strategy so convincing.

**Fala 3:** Now let's speed things up. The first session lasted six thousand one hundred eighty-one spins. And the balance climbed to almost forty thousand dollars.

**Fala 4:** Notice that the balance can spend a long time going up. But every now and then, a losing streak shows up that's bigger than the ones before it. And in those moments, the size of the bets starts to explode.

**Fala 5:** At the end of the first session, we lost eleven times in a row. The bet went from ten dollars all the way to ten thousand two hundred forty.

**Fala 6:** That was twenty thousand four hundred seventy dollars lost in one go. We had nineteen thousand four hundred ninety left, and the next bet would have been twenty thousand four hundred eighty. The session ended right there.

**Fala 7:** That first session, by the way, still ended with a profit. But let's keep going.

**Fala 8:** The worst streak came in session three hundred twenty-three. After almost forty thousand spins, the balance had reached two hundred three thousand dollars.

**Fala 9:** Then came fourteen losses in a row. The last bet was eighty-one thousand nine hundred twenty dollars. And one hundred sixty-three thousand dollars vanished in a single streak.

**Fala 10:** Look at what happened here. We started out trying to win ten dollars. But after several losses in a row, we had to risk thousands.

**Fala 11:** And that's the moment you see the difference between winning often and having a profitable strategy.

**Fala 12:** We've now completed one million spins. In total, there were four hundred eighty-eight sessions.

**Fala 13:** Of those, four hundred eighty-seven ended because there wasn't enough money to keep the strategy going. The last one was cut off when the millionth spin arrived.

**Fala 14:** The aggregate financial result was a loss of two million one hundred sixty-four thousand six hundred thirty dollars.

**Fala 15:** But there's something even more important than the final balance. It's the distribution of the results.

**Fala 16:** The strategy won its ten dollars four hundred eighty-six thousand five hundred thirty-nine times. That's ninety-nine point nine percent of all sequences.

**Fala 17:** Add it all up, and that's four million eight hundred sixty-five thousand dollars of profit, in small pieces.

**Fala 18:** But the four hundred eighty-seven busts took away seven million thirty thousand dollars. On average, more than fourteen thousand dollars each.

**Fala 19:** Of the sessions that ran out of money, fifty-two closed with a profit. The other four hundred thirty-five closed with a loss.

**Fala 20:** Look at the gap between the small, frequent wins and the big losses. That gap is what explains how this strategy behaves.

**Fala 21:** And now we can answer the original question with a surprisingly simple calculation.

### A08 | The math reveals the problem
Screen: back to the 37-pocket wheel; expected value equation written step by step: E = (18/37) × 10 − (19/37) × 10 = −10/37 ≈ −$0.27; "≈ 2.70% of the amount bet". Then the comparison with the simulation: expected −1,619,589 against actual −2,164,630; range of the 100 repetitions (−4.11% to +4.47%, average −2.72%).

**Fala 1:** Now let's understand why this happens. Imagine a single ten-dollar bet on red.

**Fala 2:** There are eighteen outcomes where you win ten dollars. And nineteen outcomes where you lose ten.

**Fala 3:** We can calculate the average expected result of this bet. We multiply the probability of winning by the profit. Then we subtract the probability of losing times the loss.

**Fala 4:** The result is about minus twenty-seven cents. That means for every ten dollars you bet, the expected loss is about twenty-seven cents.

**Fala 5:** It doesn't mean you'll lose twenty-seven cents on every spin. On any given spin, you either win ten dollars or lose ten.

**Fala 6:** But when we look at a very large number of bets, that small disadvantage shows up in the average. It's two point seven percent of everything you bet.

**Fala 7:** In our million spins, almost sixty million dollars were wagered. The math predicted a loss of about one point six million.

**Fala 8:** The actual loss was bigger, about two point one six million. That happens because Martingale losses come packed into a few enormous busts, so the result of a single sample swings quite a bit.

**Fala 9:** So we ran the entire experiment one hundred more times, each with a different sequence of spins. On average, the loss was two point seven two percent of the amount bet. Almost exactly what the math says.

**Fala 10:** The worst run lost four point one one percent. And one, out of the hundred, ended with a profit.

**Fala 11:** And here's the key point. When you double your bet after a loss, the probability of the next spin doesn't change.

**Fala 12:** The wheel still has eighteen red pockets out of thirty-seven. It doesn't know you just lost five times in a row. There's no automatic balancing out.

**Fala 13:** Every new spin has the same probability of winning. And when you raise the amount you bet, you also raise the amount of money exposed to the wheel's mathematical edge.

**Fala 14:** So the Martingale doesn't eliminate the house edge. It only changes the way the wins and losses show up.

**Fala 15:** You can have lots of sessions with small profits. But the occasional losses can be big enough to wipe out those gains.

**Fala 16:** That's why a strategy can seem to work for a long time and still have a negative expected profit.

**Fala 17:** The math isn't saying it's impossible to walk out of a casino a winner. That happens. It's saying that doubling your bets doesn't turn an unfavorable game into a favorable one.

### A09 | The unexpected consequence
Screen: transition from the wheel to a sheet of aged paper; chart with many small gains and one big loss; then a simple picture of risk and return (how often it wins x how much it loses). No dramatic effects.

**Fala 1:** But you know what I find most interesting about this experiment? This same flaw in reasoning shows up in lots of places outside casinos.

**Fala 2:** Imagine someone who came up with an investment strategy. For six months, it made money almost every single week.

**Fala 3:** That person starts to believe they've found a safe way to make a profit. But there's one question they may not have asked. What happens when the strategy goes wrong?

**Fala 4:** Because a streak of good results isn't enough to prove that a strategy is good. We also need to consider how big the possible losses are. And how likely they are to happen.

**Fala 5:** That's exactly what we saw with the roulette wheel. The Martingale can produce lots of winning streaks. But those wins don't remove the risk of a very large loss.

**Fala 6:** And there's a huge difference between winning often and making money consistently.

**Fala 7:** At the start of this video, our question was whether we could beat a casino using math. And the answer is that this strategy can't eliminate the mathematical edge of the roulette wheel.

**Fala 8:** In fact, the math showed us why it seems to work so well for a while. And why that appearance can be misleading.

**Fala 9:** Maybe that's the most important discovery of this experiment. When someone shows you a strategy that seems to work almost every time, the most important question may not be how often it wins.

**Fala 10:** It may be how much it loses when it finally goes wrong.

### A10 | Closing
Screen: ivory background with a subtle paper texture; the closing sentence written in two parts ("looking only at the results", then "understanding the math behind them"); no brand name; no glow; cut to black.

**Fala 1:** That's the difference between looking only at the results and understanding the math behind them.
