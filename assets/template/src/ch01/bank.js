'use strict';
/* =================================================================
 * THE ITEM BANK
 *
 * Every wrong option below is a mistake students actually make — a
 * named misconception, a sign error, a rule misapplied. That matters:
 * distractors have to be plausible enough to pull real students
 * (the standard is >5% of low performers), and implausible ones make
 * an item measure nothing. Each carries the reason it's wrong, because
 * the feedback is where the learning happens, not the score.
 *
 * `home` = the checkpoint an item debuts at. `fnd` = foundation, used
 * for the quiz breakdown.
 * ================================================================= */
var FND = ['Scarcity & method', 'Incentives', 'Trade-offs', 'Opportunity cost', 'Marginal thinking', 'Trade creates value'];

var BANK = [
  /* ---- checkpoint 1: scarcity & incentives ---- */
  { id: 'sc1', home: 1, fnd: 1, type: 'mcq', short: 'What scarcity means',
    stem: 'A signed poster of a band nobody has heard of exists in only one copy worldwide. Bottled water exists in billions. Which is <em>scarce</em> in the economic sense?',
    opts: [
      { t: 'Bottled water, because people want more of it than can be had at zero cost', ok: true },
      { t: 'The poster, because there is only one of them', why: 'This is the rare-vs-scarce confusion. Rarity is about quantity supplied; scarcity is about quantity supplied <em>relative to wants</em>. Nobody wants the poster, so it is rare but not scarce.' },
      { t: 'Both, since both exist in finite amounts', why: 'Finite is not the test. If an item exists in finite quantity but no one wants more of it than exists, there is no scarcity — no allocation problem to solve.' },
      { t: 'Neither, because both can be bought', why: 'Being purchasable is evidence of scarcity, not evidence against it. A price exists precisely because the good is scarce.' }
    ] },
  { id: 'pn1', home: 1, fnd: 1, type: 'mcq', short: 'Positive vs normative',
    stem: 'Which of these is a <em>positive</em> statement?',
    opts: [
      { t: 'Rent control reduces the number of apartments available in the long run', ok: true },
      { t: 'The government ought to make housing more affordable', why: '"Ought" signals a value judgement. No dataset can settle whether something <em>should</em> happen — that is normative.' },
      { t: 'It is unfair that landlords can raise rents without limit', why: '"Unfair" is a value judgement. Normative statements can be widely agreed with and still be normative.' },
      { t: 'Housing policy is the most important issue facing the state', why: '"Most important" ranks by values, not by evidence. Normative.' }
    ] },
  { id: 'in1', home: 1, fnd: 2, type: 'mcq', short: 'Direct vs indirect incentive',
    stem: 'A university replaces letter grades with pass/fail in a tough course. Enrolment rises, and average hours studied per enrolled student falls. Which part is the <em>indirect</em> incentive?',
    opts: [
      { t: 'The drop in study hours, because removing the grade reward lowered the payoff to extra effort', ok: true },
      { t: 'The rise in enrolment, because that is what the policy was meant to encourage', why: 'That is the <em>direct</em> effect — the outcome the designers were aiming at. Indirect effects are the ones nobody put in the announcement.' },
      { t: 'Neither, since both were caused by the same policy', why: 'Both being caused by the policy is exactly why they are both incentive effects. Direct vs indirect is about whether the effect was the intended target, not about what caused it.' },
      { t: 'Both equally, because the policy changed two things at once', why: 'The policy changed one thing — the grading rule. The two outcomes differ in kind: one was the goal, one was a side effect.' }
    ] },
  { id: 'in2', home: 1, fnd: 2, type: 'classify', short: 'Classifying incentives',
    stem: 'Sort each one. A <em>positive</em> incentive rewards an action; a <em>negative</em> one penalises it.',
    cats: ['Positive incentive', 'Negative incentive'],
    rows: [
      { t: 'A $2,000 scholarship for keeping a 3.5 GPA', cat: 'Positive incentive' },
      { t: 'A $75 fine for parking in a staff space', cat: 'Negative incentive' },
      { t: 'A late-submission penalty of 10% per day', cat: 'Negative incentive' },
      { t: 'A deposit refunded when you return the bottle', cat: 'Positive incentive' }
    ],
    why: 'Watch the bottle deposit: paying the deposit feels like a penalty, but the <em>refund for returning it</em> is the thing that changes behaviour, and it rewards the action. Ask what the incentive does to the cost–benefit of the action you want.' },

  /* ---- checkpoint 2: trade-offs ---- */
  { id: 'to1', home: 2, fnd: 3, type: 'mcq', short: 'Trade-off vs opportunity cost',
    stem: 'You skip a shift to study. You could instead have worked ($90), gone to the gym, or slept. What is the <em>opportunity cost</em> of studying?',
    opts: [
      { t: 'The $90 shift — the single most valuable thing you gave up', ok: true },
      { t: 'The shift, the gym and the sleep, all together', why: 'That is the list of <em>trade-offs</em>. Opportunity cost is the single highest-valued alternative, not the sum of everything forgone — otherwise you could inflate any cost by listing more options you never would have taken.' },
      { t: 'Zero, since you chose studying and so preferred it', why: 'Preferring your choice does not make it free. Opportunity cost is what the alternative was worth, regardless of which you picked — it is a cost even when the choice is correct.' },
      { t: '$90 plus the value of the gym and the sleep', why: 'Double counting. You could only have done one of them with that time, so only the best one is forgone.' }
    ] },
  { id: 'to2', home: 2, fnd: 3, type: 'mcq', short: 'No free lunch',
    stem: 'A campus concert is free to attend, with no ticket and no fee. An economist says it still has a cost. What is the cost?',
    opts: [
      { t: 'The time, which could have gone to the next-best use', ok: true },
      { t: 'Nothing — "free" means zero cost by definition', why: 'This is the free-lunch error. Money price and cost are different things. Time is a scarce resource, so spending it always forecloses something.' },
      { t: 'Only the cost to whoever paid for the concert', why: 'Their cost is real but it is <em>their</em> cost. The question asks about the cost to the attendee, and the attendee spends time.' },
      { t: 'The travel cost of getting there, and nothing else', why: 'Travel is part of it, but the dominant cost for a three-hour concert is the three hours.' }
    ] },

  /* ---- checkpoint 3: opportunity cost ---- */
  { id: 'oc1', home: 3, fnd: 4, type: 'numeric', short: 'Computing economic cost',
    stem: 'Maya quits a $38,000-a-year job for a two-year master\'s. Tuition is $21,000 a year. Her food and housing cost $15,000 a year — the same as they would have if she had kept working. What is the <em>economic cost</em> of the degree over the two years?',
    pre: '$', answer: 118000, tol: 0,
    why: 'Explicit = $21,000 × 2 = $42,000. Implicit = $38,000 × 2 = $76,000 of forgone salary. Total = <strong>$118,000</strong>. Food and housing are explicitly stated to be unchanged, so they are not a cost <em>of this choice</em> — including them gives $148,000, the single most common wrong answer. Leaving out the forgone salary gives $42,000, the second most common.' },
  { id: 'oc2', home: 3, fnd: 4, type: 'mcq', short: 'The living-expenses trap',
    stem: 'Why do economists normally leave ordinary food and housing out of the cost of attending college?',
    opts: [
      { t: 'Because you would incur them whether or not you attended, so they do not change with the decision', ok: true },
      { t: 'Because they are implicit costs rather than explicit ones', why: 'They are explicit — you pay real money for them. The reason to exclude them is not their type but that they do not <em>change</em> with the decision.' },
      { t: 'Because they are small compared with tuition', why: 'Size is irrelevant, and they often are not small. A cost is excluded because it is unaffected by the choice, not because it is minor.' },
      { t: 'Because students usually have them paid by someone else', why: 'Who pays does not determine whether something is a cost of the decision. The test is whether the cost changes when the decision changes.' }
    ] },
  { id: 'oc3', home: 3, fnd: 4, type: 'mcq', short: 'Sunk costs',
    stem: 'You paid $600, non-refundable, for a flight. The day before, a free trip you would enjoy far more comes up. What should the $600 do to your decision?',
    opts: [
      { t: 'Nothing — it is gone either way, so compare only the two trips', ok: true },
      { t: 'Push you to take the paid flight, so the $600 is not wasted', why: 'This is the sunk-cost fallacy, and it is the single most tested error in the chapter. Taking the worse trip does not recover the $600; it just adds a worse experience to a loss you already have.' },
      { t: 'Count as the opportunity cost of taking the free trip', why: 'Opportunity cost is what you give up <em>by choosing</em>. The $600 is unrecoverable under both choices, so no choice forgoes it.' },
      { t: 'Be split between the two options, since both are affected', why: 'Neither option is affected by it. A cost that is identical across all options cannot discriminate between them.' }
    ] },

  /* ---- checkpoint 4: marginal thinking ---- */
  { id: 'mt1', home: 4, fnd: 5, type: 'mcq', short: 'The stopping rule',
    stem: 'A bakery is deciding how many extra loaves to bake. Which rule maximises net benefit?',
    opts: [
      { t: 'Keep baking while marginal benefit exceeds marginal cost; stop where they are equal', ok: true },
      { t: 'Keep baking while total benefit is still rising', why: 'Total benefit keeps rising long after each extra loaf has stopped covering its own cost. This rule systematically overshoots — in the model above it costs most of the available net benefit.' },
      { t: 'Bake the quantity where marginal benefit is highest', why: 'Marginal benefit is usually highest on the very first unit, so this rule says bake almost nothing. It confuses the <em>level</em> of MB with the comparison between MB and MC.' },
      { t: 'Bake while average cost is falling', why: 'Average cost can still be falling when the next unit already costs more than it returns. Decisions at the margin use marginal quantities, not averages.' }
    ] },
  { id: 'mt2', home: 4, fnd: 5, type: 'numeric', short: 'Finding the optimum',
    stem: 'For the <em>q</em>-th hour of studying, marginal benefit is MB = 90 − 6q and marginal cost is MC = 18 + 6q. How many <em>whole</em> hours should you study?',
    pre: '', answer: 6, tol: 0,
    why: 'Set MB = MC: 90 − 6q = 18 + 6q → 72 = 12q → q = 6. Check it: hour 6 gives MB 54 against MC 54 — exactly break-even and worth taking; hour 7 gives MB 48 against MC 60, a loss of 12. The answer is <strong>6</strong>. Solving MB = 0 instead gives 15, which is the "maximise total benefit" error.' },
  { id: 'mt3', home: 4, fnd: 5, type: 'mcq', short: 'Marginal vs all-or-nothing',
    stem: 'An airline\'s flight has 4 empty seats at departure. Average cost per passenger on the route is $210. A standby traveller offers $70. The extra cost of carrying one more person is about $12. Should they take it?',
    opts: [
      { t: 'Yes — $70 exceeds the $12 marginal cost, so it adds $58', ok: true },
      { t: 'No — $70 is well below the $210 it costs to carry a passenger', why: 'The $210 is an <em>average</em>, and it includes costs incurred whether or not this person boards (fuel for the plane, crew, the gate). Decisions at the margin compare against marginal cost, never average cost.' },
      { t: 'No, because selling below average cost means losing money on the flight', why: 'The flight\'s fixed costs are already committed — they are sunk at this point. Refusing $70 does not avoid them; it just forgoes $58.' },
      { t: 'Only if they can fill all four seats at that price', why: 'Each seat is a separate marginal decision. One profitable sale is worth making even if the other three go empty.' }
    ] },

  /* ---- checkpoint 5: trade creates value ---- */
  { id: 'tv1', home: 5, fnd: 6, type: 'mcq', short: 'Why trade is positive-sum',
    stem: 'You sell a used textbook for $55. You valued keeping it at $30; the buyer valued having it at $80. How much value did the trade create?',
    opts: [
      { t: '$50 — the gap between what it was worth to each of you', ok: true },
      { t: '$0 — you gained $25 and the buyer lost $25, so it nets out', why: 'This is the zero-sum error. The buyer did not lose $55; they <em>exchanged</em> $55 for something worth $80 to them, gaining $25. Both sides gain, which is why both agreed.' },
      { t: '$55 — the amount of money that changed hands', why: 'Money changing hands is a transfer, not value creation. The value created is the improvement in how well the object is matched to its owner.' },
      { t: '$25 — only your own gain counts, since you were the seller', why: 'Total value created is both surpluses added together: your $25 plus the buyer\'s $25 = $50, which equals $80 − $30.' }
    ] },
  { id: 'tv2', home: 5, fnd: 6, type: 'mcq', short: 'What price does and does not do',
    stem: 'Same textbook: your cost $30, buyer\'s value $80. You haggle the price from $55 up to $70. What happens to the <em>total</em> value created?',
    opts: [
      { t: 'It stays $50 — only the split between you changes', ok: true },
      { t: 'It rises, because the seller now captures more', why: 'The seller does capture more ($40 instead of $25), but every dollar of that comes out of the buyer\'s surplus. Total value created is buyer\'s value minus seller\'s cost, and neither moved.' },
      { t: 'It falls, because the buyer is worse off', why: 'The buyer is worse off than at $55, but still better off than not trading ($10 of surplus). The total is unchanged — haggling moves the line between the two bars, not the end of the bar.' },
      { t: 'It cannot be determined without knowing who needed the deal more', why: 'Bargaining power determines the <em>split</em>. The size of the pie is fixed by the two valuations alone.' }
    ] },
  { id: 'tv3', home: 5, fnd: 6, type: 'classify', short: 'Which foundation is this',
    stem: 'Each scenario is built to test one foundation. Name it.',
    cats: ['Incentives', 'Trade-offs', 'Opportunity cost', 'Marginal thinking', 'Trade creates value'],
    rows: [
      { t: 'A toll on a bridge leads drivers to use a longer free route, worsening traffic there', cat: 'Incentives' },
      { t: 'A firm asks whether the eleventh delivery van earns more than it costs to run', cat: 'Marginal thinking' },
      { t: 'A country with a cold climate imports fruit and exports software', cat: 'Trade creates value' },
      { t: 'A student quantifies the $31,000 salary she gave up to go back to school', cat: 'Opportunity cost' },
      { t: 'A city can fund either a library or a pool with the same money, not both', cat: 'Trade-offs' }
    ],
    why: 'The giveaway in each: a behaviour change in response to a changed cost → incentives. A question about <em>one more</em> unit → marginal. Specialising and exchanging → trade. A single quantified forgone alternative → opportunity cost. Two options, one budget → trade-offs.' }
];

/* The quiz draws from its own pool, interleaved rather than blocked. */
var QUIZ = [
  { id: 'q1', fnd: 4, type: 'mcq', short: 'Economic vs accounting profit',
    stem: 'Devi leaves a $60,000 job to run a shop out of a building she owns and could rent out for $18,000 a year. The shop earns $140,000 in revenue with $55,000 of explicit costs. What is her <em>economic</em> profit?',
    opts: [
      { t: '$7,000', ok: true },
      { t: '$85,000', why: 'That is accounting profit: $140,000 − $55,000. It omits both implicit costs — the $60,000 salary and the $18,000 of forgone rent.' },
      { t: '$25,000', why: 'This subtracts the forgone salary but forgets the forgone rent. The building is a resource she owns and uses up, so its rental value is an implicit cost.' },
      { t: '$67,000', why: 'This subtracts the forgone rent but not the salary. Both are implicit costs and both count.' }
    ] },
  { id: 'q2', fnd: 2, type: 'mcq', short: 'Unintended consequences',
    stem: 'A city caps rents well below market. Over several years the housing stock available for rent shrinks. In the five-foundations framing, the shrinkage is best described as:',
    opts: [
      { t: 'An indirect incentive effect — landlords respond to a lower payoff by supplying less', ok: true },
      { t: 'A trade-off, since the city chose affordability over supply', why: 'The city did face a trade-off, but the <em>mechanism</em> producing the shrinkage is behavioural: owners responded to a changed payoff. That is an incentive effect.' },
      { t: 'An opportunity cost of the policy', why: 'Loosely, yes — but opportunity cost names the best forgone alternative to a choice. The question asks what produced the shrinkage, and that is landlords responding to incentives.' },
      { t: 'Evidence that trade does not create value in housing', why: 'Nothing here bears on whether trade creates value. The cap restricts which trades may occur; it does not show that the trades were valueless.' }
    ] },
  { id: 'q4', fnd: 5, type: 'numeric', short: 'Marginal optimum',
    stem: 'A food truck\'s marginal benefit from the <em>q</em>-th hour open is MB = 120 − 10q; marginal cost is MC = 20 + 10q. How many whole hours should it stay open?',
    pre: '', answer: 5, tol: 0,
    why: '120 − 10q = 20 + 10q → 100 = 20q → q = 5. Hour 5: MB 70, MC 70 — break even, take it. Hour 6: MB 60, MC 80 — a $20 loss. Answer: <strong>5</strong>.' },
  { id: 'q5', fnd: 6, type: 'mcq', short: 'Gains from trade direction',
    stem: 'Two roommates both prefer a tidy kitchen. Ana finds dishes quick and vacuuming miserable; Ben is the reverse. They each specialise and swap. This illustrates:',
    opts: [
      { t: 'Trade creating value through differences in opportunity cost', ok: true },
      { t: 'Trade creating value by producing more total output', why: 'More output is usually a <em>result</em>, but the source of the gain is that each person\'s opportunity cost differs. Even with identical total output, matching tasks to the lower-cost person creates value.' },
      { t: 'Marginal thinking, because each is doing one more chore', why: 'No marginal comparison is being made here. The structure is specialise-then-exchange, which is the trade foundation.' },
      { t: 'A trade-off, because each gives up one chore to do another', why: 'There is a trade-off involved, but the point of the example is that the swap leaves <em>both</em> better off — that is trade creating value.' }
    ] },
  { id: 'q6', fnd: 4, type: 'mcq', short: 'Sunk cost in business',
    stem: 'A studio has spent $40M on a film. Finishing it costs another $10M, and the finished film would earn $25M. Abandoning it earns nothing. What should they do?',
    opts: [
      { t: 'Finish it — $25M beats the $10M still required', ok: true },
      { t: 'Abandon it, since $50M of total cost exceeds $25M of revenue', why: 'The $40M is sunk — it is lost under both options. Comparing total spend against revenue leads you to abandon a project that will return $25M for a further $10M.' },
      { t: 'Finish it only if the total eventually exceeds $50M', why: 'That treats the sunk $40M as recoverable. It never is. The only live comparison is $10M more against $25M in.' },
      { t: 'Abandon it to avoid throwing good money after bad', why: 'The phrase describes the opposite error. Here the extra $10M returns $25M — that is good money after a good marginal bet, on top of a loss that exists regardless.' }
    ] },
  { id: 'q8', fnd: 3, type: 'mcq', short: 'Opportunity cost of a gift',
    stem: 'You receive a non-transferable, non-refundable ticket to a Saturday game. You would otherwise have worked a $120 shift, or studied (worth about $60 to you). The opportunity cost of attending is:',
    opts: [
      { t: '$120', ok: true },
      { t: '$0, because the ticket was a gift', why: 'The ticket being free makes the <em>explicit</em> cost zero. The implicit cost — your Saturday — is unaffected by how you got the ticket.' },
      { t: '$180', why: 'Summing the alternatives double-counts the same block of time. You could only have done one of them.' },
      { t: 'The face value printed on the ticket', why: 'Face value is irrelevant: it is neither what you paid (nothing) nor what you gave up (the shift).' }
    ] },
  { id: 'q9', fnd: 2, type: 'classify', short: 'Direct or indirect',
    stem: 'A city installs speed bumps on a residential street. Classify each outcome.',
    cats: ['Direct effect', 'Indirect effect'],
    rows: [
      { t: 'Average traffic speed on that street falls', cat: 'Direct effect' },
      { t: 'Some drivers reroute through an adjacent street, raising its traffic', cat: 'Indirect effect' },
      { t: 'Ambulance response times to the street get slightly longer', cat: 'Indirect effect' },
      { t: 'Collisions on the treated street decline', cat: 'Direct effect' }
    ],
    why: 'The test is whether the outcome is the one the policy was aiming at. Speed and collisions on the treated street are the target; everything that happens <em>elsewhere</em> or to <em>other objectives</em> is the indirect incentive at work.' },
  { id: 'q10', fnd: 6, type: 'numeric', short: 'Total surplus',
    stem: 'A seller would part with a bike for no less than $140. A buyer values it at $230. They settle at $185. What is the total value created by the trade?',
    pre: '$', answer: 90, tol: 0,
    why: '$230 − $140 = <strong>$90</strong>. Split: consumer surplus $45, producer surplus $45 — but you did not need the price to get the total. $185 is there to see whether you reach for the price; the total depends only on the two valuations.' },
  { id: 'q11', fnd: 5, type: 'mcq', short: 'Average vs marginal',
    stem: 'A gym\'s average cost per member is $42/month. Adding one more member to an under-capacity gym costs about $4/month. A prospect offers $20/month. Taking the offer:',
    opts: [
      { t: 'Adds $16/month, because the relevant comparison is marginal cost', ok: true },
      { t: 'Loses $22/month, because $20 is below the $42 average cost', why: 'Average cost spreads fixed costs — building, equipment, staff — across members. Those do not change when one more person joins. Marginal decisions use marginal cost.' },
      { t: 'Breaks even, since discounts cancel out across members', why: 'Nothing cancels. The gym receives $20 and incurs $4, a gain of $16.' },
      { t: 'Cannot be evaluated without knowing total membership', why: 'Total membership would matter if the gym were at capacity — then the marginal cost would be much higher. The question states it is under capacity.' }
    ] },
  { id: 'q12', fnd: 1, type: 'mcq', short: 'Scarcity and the three questions',
    stem: 'Why does every society, regardless of its politics, have to answer what to produce, how, and for whom?',
    opts: [
      { t: 'Because resources are scarce relative to wants, so not everything can be produced at once', ok: true },
      { t: 'Because governments need to plan production', why: 'Market economies answer the three questions too — through prices rather than plans. The questions arise from scarcity, not from the existence of a planner.' },
      { t: 'Because some goods are rare', why: 'Rarity of particular goods is not the driver. Even with abundant resources of every kind, unlimited wants would still force allocation choices.' },
      { t: 'Because people have unequal incomes', why: 'Inequality shapes <em>who gets what</em>, but the three questions would still need answering in a perfectly equal society with scarce resources.' }
    ] }
];