# VORTTUM 002 (EN-US) | What If You Jumped Into a Tunnel Through the Earth?

Format: YouTube 16:9 (1920x1080). Voice: en-US-AndrewMultilingualNeural. All on-screen text in LaTeX (Latin Modern), no italics. No brand name on screen.
Alternative title: I Fell Through the Earth. Where Would I Stop?
Units: narration uses miles and mph (US audience); equations and on-screen calculations use SI (m, s, m/s²).
Language level: anyone can follow every step without a physics background, but the real formulas, numbers and names stay in. Each technical term appears once, named correctly and explained on the spot.

## Numbers checked in code (simulacao.py)

- Earth radius R = 6,371 km (3,959 mi). Tunnel length 12,742 km (7,918 mi).
- Uniform model, g = 9.81 m/s²: time to the center 21.1 min; full crossing t = π·√(R/g) = 2,531.7 s = 42.2 min.
- Uniform model, top speed at the center √(g·R) = 7,906 m/s = 7.9 km/s = 28,460 km/h = 17,700 mph.
- g = 9.81 m/s²: falling speed grows by about 22 mph every second.
- PREM (Dziewonski & Anderson, 1981), numerical integration: model mass 5.973 × 10²⁴ kg, surface g 9.82 m/s² (both match the real Earth).
- PREM gravity: 9.82 at the surface, 10.02 at 670 km deep, peak 10.69 m/s² at 2,891 km deep (core–mantle boundary), then falls to zero at the center.
- PREM crossing: center at 19.1 min, top speed 9,919 m/s = 9.9 km/s = 22,200 mph; full crossing 2,290.6 s = 38.2 min.
- Curiosity: with constant g = 9.81 m/s² all the way down, the crossing would take 38.0 min.

---

### T01 | The hook (0:00–0:35)
Style: editorial cut-out and scientific engraving.
Screen: Earth cut in half from the first frame. A thin dark tunnel through the center. A small figure falls, passes the center and starts rising on the other side (first 10 s). An old clock appears. Freeze before the figure reaches the far side.

**Fala 1:** If you jumped into a hole that went straight through the Earth, something would happen that sounds impossible.

**Fala 2:** You would fall for thousands of miles. You would pass right through the center of the planet. And at some point, you would start going up. With no engine at all.

**Fala 3:** But there's an even stranger part. There's a calculation that says you could reach the other side in just forty-two minutes.

**Fala 4:** How is that possible? And what happens when you get there?

### T02 | Building the experiment (0:35–2:00)
Style: aged paper and blueprint.
Screen: Earth in section. Straight tunnel from surface to surface through the center. Labels enter only when spoken: Surface, Center, Other side, R ≈ 6,371 km, tunnel ≈ 12,742 km. Checklist of assumptions, one item per line: no air, no friction, unbreakable walls, no rotation. A small capsule at the entrance.

**Fala 1:** To find out what would happen, we need to build an experiment.

**Fala 2:** Picture a tunnel drilled all the way through the Earth. Perfectly straight. It starts at one point on the surface, goes through the center of the planet and comes out on the exact opposite side.

**Fala 3:** That's about seven thousand nine hundred miles of tunnel.

**Fala 4:** Now let's make it completely empty. No air. No friction. And walls that never break.

**Fala 5:** For now, we'll also ignore the fact that the Earth spins.

**Fala 6:** Of course, nobody could build this today. Deep inside the planet, the heat and the pressure are enormous.

**Fala 7:** But we don't want to build the tunnel. We want to know what physics says would happen inside it.

**Fala 8:** So we put a small capsule at the entrance. We let go. And we let gravity do the work.

**Fala 9:** The first question is simple. What happens to the speed as it falls?

### T03 | The fall begins (2:00–3:30)
Style: Manim, force diagram.
Screen: capsule going down the tunnel. Gravity arrow pointing to the center. Speedometer and distance counter (values from the simulation). Formula block with g = 9.8 m/s² appears when spoken.

**Fala 1:** The moment we let go, the capsule starts to fall. The Earth is pulling it. That pull is gravity.

**Fala 2:** At the surface, gravity speeds things up by about nine point eight meters per second, every second. In everyday terms, the capsule goes about twenty-two miles per hour faster with each second of the fall.

**Fala 3:** So at the start, the speed climbs fast.

**Fala 4:** But here's an interesting question. As the capsule gets closer to the center of the Earth, does gravity get stronger or weaker?

**Fala 5:** Most people would guess stronger. After all, we're getting closer to the middle of the planet.

**Fala 6:** But there's a detail. Once you're inside the Earth, part of the planet is above you. Behind you. All around you. And that rock pulls on you too.

**Fala 7:** So we need to figure out how all those pulls add up. Because the answer changes everything that happens to the capsule.

### T04 | The gravity paradox (3:30–5:20)
Style: Manim, geometry.
Screen: Earth as concentric layers. Capsule inside. One shell around the capsule lights up. Two cones from the capsule: a small near patch of the shell and a large far patch; arrows of equal size, cancelling. Then the inner ball (mass below the capsule) lights up. Build g(r) = G·M(r)/r² piece by piece; M(r) labeled "mass inside radius r". Graph of g against distance from the center: straight line from zero at the center to 9.8 at the surface; mark the halfway point (half the distance, half the gravity).

**Fala 1:** This is where one of the most elegant ideas in physics comes in. It's called the shell theorem. Isaac Newton proved it.

**Fala 2:** Picture a hollow ball, with its mass spread evenly. And you're floating somewhere inside it.

**Fala 3:** The part of the shell close to you pulls harder, because it's close. But it's a small piece. The part on the far side is farther away, so each bit of it pulls weaker. But it's a much bigger piece.

**Fala 4:** And here's the surprise. Those two effects cancel out exactly. In every direction. Inside a shell like that, the total pull is zero.

**Fala 5:** Now think of the Earth as a stack of shells, like the layers of an onion. When the capsule is inside the planet, every layer above it cancels itself out.

**Fala 6:** The only thing still pulling is the ball of rock below it. The part closer to the center than the capsule is.

**Fala 7:** That's what this formula says. g is the gravity. G is a fixed number of nature. r is the distance to the center. And M of r is only the mass inside that distance.

**Fala 8:** Now let's simplify. Let's pretend the whole Earth is made of the same material, equally heavy everywhere.

**Fala 9:** In that case, the deeper the capsule goes, the smaller that inner ball gets. And gravity drops in a very simple way. Halfway to the center, gravity is cut in half.

**Fala 10:** And at the exact center of the Earth, it reaches zero.

**Fala 11:** So the capsule doesn't run into stronger and stronger gravity. It runs into weaker and weaker gravity.

**Fala 12:** Which raises another question. If gravity hits zero at the center, does the capsule stop?

### T05 | The center of the Earth (5:20–6:50)
Style: Manim, dynamic simulation.
Screen: capsule reaching the center. Two separate graphs, drawn as the capsule moves: acceleration vs. position (falls to zero at the center) and speed vs. position (peaks at the center). Result box: 7.9 km/s ≈ 17,700 mph.

**Fala 1:** This is one of the most surprising parts of the experiment.

**Fala 2:** When the capsule reaches the center of the Earth, the total pull of gravity is zero. But the capsule is far from stopped.

**Fala 3:** In fact, this is exactly where it's moving fastest. About seven point nine kilometers per second. That's almost eighteen thousand miles per hour.

**Fala 4:** Why? Because for the whole first half of the trip, gravity was pulling the capsule toward the center. The pull kept getting weaker. But it always pointed the way the capsule was going.

**Fala 5:** Think of pushing a car. Even if you push softer and softer, as long as you keep pushing forward, the car keeps speeding up.

**Fala 6:** So the speed kept growing. All the way to the center.

**Fala 7:** And now the capsule shoots past the center. From this moment on, gravity pulls the other way. Back toward the center.

**Fala 8:** The capsule keeps moving forward. But now it's losing speed.

**Fala 9:** So will it make it all the way to the surface on the other side?

### T06 | Going up with no engine (6:50–8:25)
Style: Manim and editorial cut-out.
Screen: capsule past the center. Speed arrow pointing to the far side; gravity arrow pointing back to the center, the speed arrow shrinking. Camera follows to the far surface; speed reaches zero. Side panel: a pendulum swinging to the same height.

**Fala 1:** Now we're in the second half of the trip.

**Fala 2:** The capsule has passed the center. It's still heading for the surface on the other side. But gravity is pulling it back.

**Fala 3:** The capsule keeps climbing up the tunnel. Slower. And slower.

**Fala 4:** Until something curious happens. It arrives exactly at the surface on the other side. And right there, its speed hits zero.

**Fala 5:** That's because, in our experiment, nothing is wasted. All the speed the capsule picked up on the way down is paid back on the way up.

**Fala 6:** It works like a pendulum. It swings down, picks up speed, and climbs back to the same height on the other side.

**Fala 7:** The difference is that our pendulum swings through an entire planet.

**Fala 8:** And there's one important detail. If nobody grabs the capsule when it reaches the far side, it won't stay there. Gravity will pull it back down. And the whole trip starts over.

**Fala 9:** But how long would that trip take?

### T07 | The 42-minute calculation (8:25–10:30)
Style: Manim, visual proof.
Screen: Earth and tunnel on the left (always visible while formulas are written), a spring with a mass on the right, oscillating in sync with the capsule. Data block with background: R = 6,371,000 m, g ≈ 9.81 m/s². Build in order: a = −(g/R)·x, with labels a (acceleration), g (gravity at the surface), R (Earth radius), x (position measured from the center). Then ω = √(g/R), T = 2π·√(R/g), t = T/2 = π·√(R/g). Full substitution: t = π·√(6,371,000 / 9.81) ≈ 2,532 s ≈ 42.2 min. Result box.

**Fala 1:** Now we can work out how long the trip takes. And the answer comes out in a really elegant way.

**Fala 2:** In our simple Earth, gravity grows in step with the distance from the center. Twice as far, twice the pull.

**Fala 3:** This equation says exactly that. The acceleration is the distance from the center times a fixed number: gravity at the surface divided by the radius of the Earth.

**Fala 4:** And the minus sign means the pull always points back toward the center. Whichever side the capsule is on.

**Fala 5:** That kind of motion has a name. Simple harmonic motion. It's the same back and forth you get with a weight on a spring.

**Fala 6:** Pull the weight down and let go. It speeds up toward the middle, passes it at top speed, slows down on the other side, and comes back. Just like our capsule.

**Fala 7:** The beauty of this equation is that it tells us the rhythm of that back and forth. The time to go from one end to the other and back. It's called the period.

**Fala 8:** But we only want the first half: from one side of the Earth to the other. So we divide the period by two.

**Fala 9:** Now we plug in the radius of the Earth, six million three hundred seventy-one thousand meters, and gravity at the surface, nine point eight one.

**Fala 10:** And we get about two thousand five hundred thirty-two seconds. Roughly forty-two minutes.

**Fala 11:** So in our idealized model, the capsule would cross the entire Earth in just over forty-two minutes. No engine. No fuel. Just gravity.

**Fala 12:** But there's a detail that could change this answer. So far, we've treated the Earth as if it were equally heavy everywhere. And the real Earth isn't like that.

### T08 | The twist: the real Earth (10:30–12:10)
Style: scientific engraving, blueprint and Manim.
Screen: two Earths side by side. Model A: uniform. Model B: layered, with a dense core (iron and nickel label). Seismic waves crossing Model B. Graph: gravity vs. depth, uniform straight line and the PREM curve (computed, not drawn by hand), rising from 9.82 to a peak of 10.69 m/s² at 2,891 km deep, then falling to zero. Capsule race: two capsules, one per model, falling at the same time; clocks stop at 42.2 min and 38.2 min. Result box: 38.2 min, top speed 9.9 km/s.

**Fala 1:** Now let's drop one of the simplifications.

**Fala 2:** The real Earth is not equally heavy everywhere. Its core is made mostly of iron and nickel. Much heavier than the rock near the surface.

**Fala 3:** That changes how gravity behaves inside the planet. In fact, as you go down, gravity first gets a little stronger.

**Fala 4:** It keeps rising for about eighteen hundred miles, almost halfway to the center. Until you reach the edge of the core. Only then does it start dropping toward zero at the center.

**Fala 5:** So the simple equation we used no longer describes the trip exactly. We need a realistic map of the inside of the Earth.

**Fala 6:** And that map exists. It's called PREM, the Preliminary Reference Earth Model. Scientists built it by studying how earthquake waves travel through the planet.

**Fala 7:** With PREM, we can calculate gravity at every point along the tunnel. And then simulate the fall, step by step.

**Fala 8:** Running that simulation, the capsule reaches the other side in about thirty-eight minutes. Four minutes faster than the simple model. And it passes the center much faster too: almost ten kilometers per second. About twenty-two thousand miles per hour.

**Fala 9:** Why faster? Because in the real Earth, gravity stays strong for much longer on the way down. In fact, if gravity stayed at nine point eight one the whole way, the trip would take thirty-eight minutes too. Almost the same as the real Earth.

**Fala 10:** And that shows something important. A calculation can be completely right under its assumptions. But change the assumptions, and the answer can change too.

**Fala 11:** And we still haven't dealt with the problems that would make this experiment much harder in the real world.

### T09 | What would really happen? (12:10–13:35)
Style: aged paper and scientific collage.
Screen: Earth in section. Items enter one at a time, one per line: Temperature, Pressure, Rotation, Air resistance, Tunnel stability. Rotation: a capsule released at the equator drifting into the wall; then a pole-to-pole tunnel along the spin axis. Air: oscillation with shrinking swings, ending at rest at the center.

**Fala 1:** So far, we've built a perfect experiment. But the real world brings some huge problems.

**Fala 2:** The first one is heat. The center of the Earth is estimated to be over five thousand degrees Celsius.

**Fala 3:** The second is pressure. At the center, it's more than three million times the air pressure we feel at the surface. Keeping a tunnel open down there would be almost impossible.

**Fala 4:** Then there's the Earth's spin. Anywhere away from the poles, the ground is moving sideways, so the capsule starts the fall already moving sideways too. As it falls, that sideways motion pushes it off course. Without some kind of guidance, it would slam into the walls.

**Fala 5:** There is one way out of this problem. Drill the tunnel from the North Pole to the South Pole, right along the axis the Earth spins around.

**Fala 6:** And if the tunnel had air, everything would change again. Air would steal a little speed on every trip back and forth.

**Fala 7:** The capsule would never make it back to the same height. Each swing would be a little shorter than the last.

**Fala 8:** And if nothing else got in the way, it would end up at rest near the center of the Earth.

**Fala 9:** So the forty-two minutes are not a prediction for a trip we could take today. They're the result of an idealized physical model.

**Fala 10:** And that's exactly what makes this experiment so interesting. We can use math to find out how a system behaves, even when it's practically impossible to build.

### T10 | The ending (13:35–14:20)
Style: Manim and aged paper.
Screen: back to the opening image, Earth cut in half. Three moments, one at a time: capsule at the surface (speed 0); capsule at the center (top speed); capsule at the far surface (speed 0). Then the full oscillation, with the spring beside it moving in sync. No brand name on screen.

**Fala 1:** So what would happen if you jumped into a tunnel through the Earth?

**Fala 2:** In the idealized model, you would speed up toward the center. You would pass it at top speed. You would keep going to the surface on the other side.

**Fala 3:** And you would get there in about forty-two minutes, with zero speed.

**Fala 4:** If nobody caught you, you would start falling again. And you would repeat that trip forever, as long as nothing was lost along the way.

**Fala 5:** The strangest part is that the same gravity that started your fall is also what stops you on the other side. The same force. At different moments of the trip.

**Fala 6:** And all of it can be predicted with the same equation that describes a weight bouncing on a spring.

**Fala 7:** A surprising connection between two things that, at first glance, have nothing in common.
