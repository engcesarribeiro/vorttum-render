# VORTTUM 003 (EN-US) | How One Tree Turned Off 50 Million People

Format: YouTube 16:9 (1920x1080). Voice: en-US-AndrewMultilingualNeural. All on-screen text in LaTeX (Latin Modern), no italics. No brand name on screen.
A/B/C test: B "How One Tree Turned Off 50 Million People" + IN 7 SECONDS · A "What If the Entire World Lost Power at Once?" + IT'S NOT A HACKER · C "To Save the Grid, Texas Cut Power to Millions" + 4 MIN FROM DARK.
Language level: anyone can follow, but the real formula, numbers and names stay in.

## Numbers checked in code (simulacao.py) and sources

- US generation 2025: 4,430 TWh (EIA) = average load of 506 GW.
- Spinning energy, inertia H = 4 s (typical; range 3 to 5 s): holds the load for about 5 s (3.9 to 6.5 s).
- Losing 10% of generation with no response: frequency falls 0.75 Hz/s; reaches 59.4 Hz in 0.8 s.
- Cascade simulation, 1,000 plants, relays between 57.5 and 58.9 Hz: lose 5% → the grid holds (lowest 59.43 Hz); lose 8% → total collapse in 3.9 s; lose 10% → collapse in 2.5 s; lose 10% with automatic load shedding (5% of customers cut at 59.3 Hz) → the grid survives (lowest 59.19 Hz).
- 2003 Northeast blackout (Aug 14): line touched an overgrown tree near Cleveland; control room alarm system had failed; about an hour from first fault to cascade; final cascade in about 7 s (ISO New England); 508 generating units at 265 plants shut down; New York lost ~80% of its generation in 6 s; 50 million people in 8 states and Ontario; some without power for up to 4 days.
- Texas, Feb 15, 2021: frequency below 59.4 Hz at 1:51 a.m.; the grid could only spend about 9 minutes below it; 4 min 37 s left when it recovered; lowest 59.302 Hz; 48.6% of generation lost at the height; officials said a collapse could have lasted weeks.
- Spain and Portugal, Apr 28, 2025: collapse in less than 90 s; about 60 million people; up to 16 h to restore.
- India, Jul 31, 2012: 620 million people, about 9% of the world population.
- Carrington storm, Sep 1, 1859: auroras as far south as Havana; telegraph systems in North America and Europe damaged. Quebec blackout, March 1989.
- Carrington-level odds: 12% per decade (Riley, 2012) → 31.9% in 30 years (about 1 in 3); 0.7% per decade (later analysis, Open Philanthropy) → 2.1% in 30 years (about 1 in 50).
- CME speed up to 2,000 km/s (Carrier Management); 150 million km / 2,000 km/s = 20.8 h. Dst: Carrington ~ -850 nT, Quebec 1989 -589 nT.
- Food: fridge safe about 4 h without power, full freezer about 48 h (FDA/USDA guidance) [CONFERIR]. Gas station pumps need electricity.
- Transformer lead time in 2010: 5 to 16 months (DOE 2014 study).
- 2003 alarm failure: software bug; screens took 59 s to refresh instead of 1 to 3 s (Wikipedia).
- Iberia 2025: overvoltage chain reaction of disconnections (Spanish government report, ENTSO-E).
- Cell towers: typical battery backup 2 to 4 h. Hospitals: generators within 10 s, about 96 h of fuel on site. Fuel pumps need electricity.
- Moderately severe storm aimed at the US: more than 350 high-voltage transformers damaged (report cited by Insurance Journal, 2014). Large power transformer lead time: 128 weeks on average (Wood Mackenzie, Q2 2025) = 2.5 years.

---

### V01 | The hook (0:00–0:13)
Style: collage (cut-out tree, map, gauge, globe).

**Fala 1:** One tree. <break time="0.35s"/> Seven seconds. <break time="0.35s"/> Fifty million people in the dark.

**Fala 2:** Texas turned off millions of people on purpose... and still came four minutes from losing everything.

**Fala 3:** But only one thing could turn off the entire world. It's not a hacker. <break time="0.5s"/> And it's hit us before.

### V02 | One tree, fifty million people (0:13–1:25)
Style: aged paper. Timeline of August 14, 2003. A line sagging into a tree. Counters.

**Fala 1:** August fourteenth, two thousand three. A hot afternoon in Ohio. Air conditioners everywhere are running at full power.

**Fala 2:** In a control room near Cleveland, the alarm system has quietly stopped working. The operators can't see what's coming.

**Fala 3:** Investigators later found the cause. A software bug had frozen the alarms. Their screens were so overloaded that they took almost a minute to refresh, instead of a second or two.

**Fala 4:** A few miles away, a high-voltage line heats up, sags... and touches a tree that nobody trimmed.

**Fala 5:** The line shuts off. The power it was carrying jumps to the lines next to it. They overheat too, and they start sagging into more trees.

**Fala 6:** For about an hour, the problem grows slowly. Then, in the last <emphasis>seven seconds</emphasis>, everything goes at once.

**Fala 7:** Five hundred and eight generating units at two hundred and sixty-five power plants shut down. New York lost about eighty percent of its power in six seconds.

**Fala 8:** Fifty million people, in eight states and part of Canada, lost power. Some of them for four days.

**Fala 9:** To understand how one tree did that in seven seconds, you need to know what's spinning behind every outlet in your house. And how little time it has to spare.

### V03 | The five-second machine (1:25–3:00)
Style: Manim, dark. Generators spinning in sync, a frequency gauge, the swing equation, the energy calculation.

**Fala 1:** Every power plant on the grid has a giant wheel inside. A generator. And it spins in perfect sync with all the others.

**Fala 2:** In North America, they all turn together sixty times per second. That's the sixty hertz printed on your phone charger.

**Fala 3:** And the whole grid lives by one rule. The power going in has to match the power coming out. Every single second.

**Fala 4:** If the plants make more than we use, the wheels speed up. If we use more than they make, the wheels slow down. So the frequency is a live meter of that balance.

**Fala 5:** And it can't drift far. The turbines inside these plants are tuned to spin at one exact speed. Push them too far off, and they start to vibrate in ways that can tear them apart. So every plant watches the frequency, all the time.

**Fala 6:** Engineers write it like this. On the left, how fast the frequency is changing. On the right, the gap between the power that's made and the power that's used.

**Fala 7:** The H is the inertia. It measures how much energy is stored in all that spinning metal.

**Fala 8:** So how much is there? We ran the numbers for the United States. Last year, the grid generated about four thousand four hundred terawatt-hours. That's an average of about five hundred gigawatts flowing at every moment.

**Fala 9:** With a typical inertia, all that spinning metal stores enough energy to keep the whole country running for about <emphasis>five seconds</emphasis>.

**Fala 10:** Five seconds. That's the entire cushion between a broken power plant and a frequency in free fall. Everything else has to react inside that window.

### V04 | The cascade (3:00–4:40)
Style: Manim, dark. Grid of 1,000 plants (dots) going dark as their relays trip, frequency chart from the simulation. Replay with load shedding.

**Fala 1:** So let's break it ourselves. We built a simulation with one thousand power plants connected to the same grid.

**Fala 2:** Each plant has a safety relay. If the frequency drops too low, the relay disconnects the plant to protect its machines. In our grid, they're set between fifty-seven and a half and fifty-nine hertz.

**Fala 3:** First test. We take away five percent of the power. The frequency dips... and holds. The grid is built to survive losing its biggest plant.

**Fala 4:** Now we take away eight percent. The frequency falls past the first relays, and they disconnect their plants to protect them.

**Fala 5:** But every plant that leaves makes the gap bigger. And it takes its spinning wheel with it, so there's less inertia to slow the fall. The frequency falls faster. And more relays trip.

**Fala 6:** In less than four seconds, the whole grid is gone. Lose ten percent, and it's over in two and a half.

**Fala 7:** That's the paradox. The safety system that protects each plant is exactly what turns a problem into total darkness. That's how one tree took out fifty million people in seven seconds.

**Fala 8:** Now let's run the ten percent again, with one change. When the frequency falls below fifty-nine point three hertz, the grid automatically cuts off five percent of its customers.

**Fala 9:** This isn't something we made up. Real grids have these relays installed, waiting for exactly this moment. Engineers call it under-frequency load shedding.

**Fala 10:** This time, the frequency stops falling. The grid survives. But some people are now sitting in the dark, on purpose.

**Fala 11:** There's only one way to stop a cascade. You turn people off before the machines turn themselves off.

### V05 | Close calls (4:40–6:00)
Style: collage. Texas frequency timeline with the 59.4 Hz line and a 4:37 countdown, then cards for Spain and Portugal and India.

**Fala 1:** In February twenty twenty-one, Texas had to make that exact choice.

**Fala 2:** A winter storm froze power plants across the state. At the worst point, almost half of the grid's generation was gone.

**Fala 3:** At one fifty-one in the morning, the frequency dropped below fifty-nine point four hertz. The grid could only survive about nine minutes down there.

**Fala 4:** Operators cut power to millions of people to pull it back up. It worked. With <emphasis>four minutes and thirty-seven seconds</emphasis> to spare.

**Fala 5:** If they had been too slow, Texas would have had to restart its grid from zero. Officials said that could have taken weeks.

**Fala 6:** In April twenty twenty-five, Spain and Portugal weren't as lucky. Their grid collapsed completely in less than ninety seconds. About sixty million people lost power, and some waited sixteen hours to get it back.

**Fala 7:** There, the problem wasn't the frequency. The voltage surged, and power plants disconnected to protect themselves, one after another. The same paradox, through a different door.

**Fala 8:** And in twenty twelve, India had the biggest blackout in history. Six hundred and twenty million people. About nine percent of everyone on Earth.

**Fala 9:** But look at what all of these have in common. Every single one of them stopped at a border.

### V06 | Is there an off switch? (6:00–7:00)
Style: Bauhaus. Separate grids as separate blocks; a cascade stopping at the edge; a hacker crossed out.

**Fala 1:** Now the real question. Could anyone turn off the entire world at once?

**Fala 2:** The first thing to know is that there is no world grid. North America alone runs on three separate grids: one in the East, one in the West, and one that covers most of Texas. Europe, China, India, Brazil and Australia each run their own.

**Fala 3:** They don't spin together. A cascade in Texas can't spread into California, because those wheels aren't in sync.

**Fala 4:** So a single failure, even a huge one, stops at the edge of its own grid.

**Fala 5:** And a hacker would have to break into dozens of different systems, run by different companies, in different countries, all at the same moment.

**Fala 6:** To turn off the whole world, you'd need something that hits every grid at the same time. Something bigger than any grid on Earth.

**Fala 7:** There is one thing like that. And it's ninety-three million miles away.

### V07 | The Sun (7:00–8:20)
Style: aged paper. Sun and Earth, the 1859 card, telegraph wire, the probability curves.

**Fala 1:** On September first, eighteen fifty-nine, an astronomer named Richard Carrington saw a burst of light on the Sun.

**Fala 2:** The Sun had just thrown a giant cloud of charged particles into space, at up to two thousand kilometers per second. At that speed, it crosses the ninety-three million miles to Earth in less than a day.

**Fala 3:** When it hit, it caused the largest solar storm ever recorded. Auroras lit up the sky as far south as Havana.

**Fala 4:** The storm pushed electric currents into long metal wires. Telegraph systems across North America and Europe were damaged.

**Fala 5:** In eighteen fifty-nine, the telegraph was the only grid we had. Today, we have high-voltage lines that run for hundreds of miles. And a long wire is exactly what a solar storm needs.

**Fala 6:** We've already had a warning. In March nineteen eighty-nine, a much smaller storm knocked out the power grid of Quebec.

**Fala 7:** Scientists measure these storms with a number called the Dst index. The Quebec storm hit about minus five hundred and eighty-nine. Carrington is estimated at about minus eight hundred and fifty. Almost one and a half times stronger.

**Fala 8:** So how likely is another Carrington? Scientists don't agree. One estimate, from scientist Pete Riley, puts it at twelve percent per decade.

**Fala 9:** That sounds small. But over thirty years, it adds up to about thirty-two percent. Roughly one in three.

**Fala 10:** Other researchers say that's too high. A later analysis put it closer to zero point seven percent per decade. That's about two percent over thirty years.

**Fala 11:** So the odds are somewhere between one in fifty and one in three. Nobody can say exactly. But nobody says zero.

### V08 | Hour by hour (8:20–10:00)
Style: Manim, dark. A large clock counter and one card per moment.

**Fala 1:** So imagine it hits tonight. Here are your next ninety-six hours.

**Fala 2:** Second zero. The lights go out. Every screen, every fridge, every traffic light.

**Fala 3:** Second ten. In hospitals, emergency generators kick in. By code, they have ten seconds to start.

**Fala 4:** Hour two. Your phone still has battery. But the cell tower down the street is running on its own. Most towers carry two to four hours of backup.

**Fala 5:** Hour four. The towers start going silent. No calls. No texts. No internet. And in your kitchen, the food in the fridge is no longer considered safe.

**Fala 6:** Hour forty-eight. Even a full freezer has thawed. And with no pumps running at gas stations, the cars that are still moving can't refuel.

**Fala 7:** Hour ninety-six. Hospitals are required to keep about ninety-six hours of fuel on site. After that, they depend on fuel trucks. And the pumps that move that fuel run on electricity.

**Fala 8:** And the grid? After a total collapse, it can't just be switched back on. Operators have to restart it from zero, one plant at a time. It's called a black start. After a normal blackout, that takes hours, sometimes days.

**Fala 9:** But after a solar storm, there's a bigger problem. The lights might not come back for years.

### V09 | Why it wouldn't come back (10:00–10:50)
Style: whiteboard with the hand drawing. A large transformer, the induced current, the wait in weeks turned into years.

**Fala 1:** The weak point is the transformer. These giant machines step the voltage up and down between the power plants and your street.

**Fala 2:** A solar storm pushes a slow, steady current into them, almost like a battery connected to the line. They were never built for that. The iron core saturates, the windings overheat, and the transformer can cook from the inside.

**Fala 3:** One report found that even a moderately severe storm aimed at the United States could damage more than three hundred and fifty of them.

**Fala 4:** And you can't buy one off the shelf. Each one is built to order. In twenty ten, the wait was somewhere between five and sixteen months. Today, the average wait for a large power transformer is about one hundred and twenty-eight weeks.

**Fala 5:** That's two and a half years. For one. Now picture hundreds of them, all ordered in the same week.

### V10 | The end (10:50–11:20)
Style: ivory paper. The frequency gauge back at 60 Hz.

**Fala 1:** So the world doesn't have an off switch. No hacker, no tree, no single mistake can turn off every grid at once.

**Fala 2:** Every blackout we've ever had was local. A region, a country, a few states. And every time, the lights came back.

**Fala 3:** But every one of them is running, right now, on a few seconds of spinning metal. And there's one thing up there that could hit all of them on the same day.

**Fala 4:** If your power went out tonight and didn't come back, how many hours do you think you'd last? Tell me in the comments.
