-- ============================================================
-- ABA Goal Library — 30 Evidence-Based Goals
-- All fields align with Program Plan template:
--   Data Collection | Prerequisite Skills | Materials | SD |
--   Correct Responses | Incorrect Responses |
--   Prompting Hierarchy | Error Correction |
--   Transfer Procedure | Reinforcement Schedule |
--   Generalization Plan | Maintenance Plan
-- ============================================================

INSERT INTO goals (
  name, domain, description,
  data_collection, prerequisite_skills, materials,
  sd, correct_responses, incorrect_responses,
  prompting_hierarchy, prompting_hierarchy_detail,
  error_correction, transfer_procedure,
  reinforcement_schedule, generalization_plan, maintenance_plan
) VALUES

-- ============================================================
-- VERBAL BEHAVIOR (6 goals)
-- ============================================================

(
  'Receptive Identification of Common Objects',
  'verbal_behavior',
  'Child will touch or point to a named common object from a field of 3.',
  'Trial-by-trial: Record + for independent correct response, - for incorrect or prompted. Record prompt level used on each trial. Calculate percentage correct per session.',
  'Maintains seated position for 2+ minutes; visually attends to stimuli presented on table; no persistent self-injurious behavior during table tasks.',
  '3–5 common objects (cup, spoon, ball, shoe, book); table and two chairs; preferred reinforcers; data sheet.',
  'Therapist places 3 objects on the table and says, "Touch [item name]."',
  'Child touches or points to the correct named object within 3 seconds, independently.',
  'Child touches a wrong object, fails to respond within 3 seconds, pushes items away, or engages in stereotypy.',
  'most_to_least',
  'Full physical prompt → Partial physical prompt → Gestural prompt (point) → Verbal prompt ("Look at the ___") → Independent.',
  '4-Step Error Correction: (1) Remove stimuli, pause 3 sec; (2) Re-present SD with full prompt; (3) Give transfer trial (easy mand or familiar task); (4) Re-present original SD — reinforce independent correct only.',
  'Once child achieves mastery criterion, rotate to new therapist while maintaining same objects. Then vary object exemplars, then vary settings (clinic → home).',
  'FR1 for each correct independent response during acquisition. Thin to VR2 once 80% independent over 2 sessions, then VR3 at mastery.',
  'Implement across minimum 3 therapists, 2 settings (clinic and home), and 5+ object exemplars per target. Generalization probes conducted monthly.',
  'Re-probe mastered targets monthly. Re-teach using original procedure if accuracy drops below 70% on two consecutive probes.'
),

(
  'Expressive Labeling of Common Objects',
  'verbal_behavior',
  'Child will vocally label a common object when shown it by the therapist.',
  'Trial-by-trial: Record + for independent vocal label, - for incorrect or prompted. Record prompt level. Calculate % correct per session.',
  'Receptive identification of at least 5 common objects; emerging vocal behavior or functional communication (PECS/AAC users adapt as appropriate); basic imitation of sounds.',
  'Common objects or pictures of objects (cup, ball, shoe, car, dog); preferred reinforcers; data sheet.',
  'Therapist holds up an object or picture and says, "What is this?" or "Say [item]."',
  'Child vocally labels the item correctly within 3 seconds (approximations accepted per individually defined criteria).',
  'Child says wrong word, makes unrelated vocalizations, remains silent for 3+ seconds, or echoes the prompt.',
  'most_to_least',
  'Full echoic prompt (therapist says word) → Partial echoic (first phoneme/syllable) → Gestural (mouth movement) → Time delay → Independent.',
  '4-Step Error Correction: (1) Block incorrect response; (2) Provide full echoic prompt; (3) Easy transfer trial; (4) Re-present SD — reinforce independent only.',
  'Vary stimuli (real objects → photos → drawings). Vary therapist. Vary question format ("What do you see?" / "Name this"). Vary reinforcer type.',
  'FR1 during initial acquisition. Thin to VR2 after 3 sessions above 80%, then VR5 at maintenance.',
  'Target labeling across 3 therapists, home and clinic environments, and varied exemplars. Include novel untrained items in monthly generalization probes.',
  'Monthly re-probes of mastered labels. Re-teach if child scores below 70% on any probe. Include mastered labels in maintenance rotation during sessions.'
),

(
  'Manding for Desired Items',
  'verbal_behavior',
  'Child will independently request (mand) for preferred items using a vocal word, sign, or AAC device.',
  'Frequency count per session: Record each spontaneous mand. Note if prompted or independent. Report rate per hour.',
  'Identifies preferred items; motivation/establishing operation for target items confirmed; basic attending skills.',
  'High-preference items identified via preference assessment; AAC device or picture cards (if applicable); motivation established by withholding preferred items briefly.',
  'Therapist withholds a preferred item or presents it out of reach and pauses, creating an establishing operation (natural motivation). No direct verbal prompt given initially.',
  'Child independently vocalizes (or uses sign/AAC) the label of the desired item within 10 seconds.',
  'Child reaches/grabs without communicating, engages in problem behavior, or makes no communicative attempt within 10 seconds.',
  'least_to_most',
  'Time delay (3 sec) → Gestural (point to item) → Partial verbal prompt → Full verbal prompt (echoic).',
  'If no response: provide full verbal prompt; child imitates; immediately deliver item. Re-present opportunity after 30-second delay.',
  'Once manding occurs at 5+ times per session, begin fading prompts across settings. Transfer to natural environment (home, school) with parent/teacher coaching.',
  'FR1 — deliver requested item immediately for every correct mand. Do not use token board during early mand training. Thin schedule only after 20+ mands/session are stable.',
  'Train manding with multiple communicative partners (parents, teachers, siblings). Conduct home visits or parent coaching sessions to generalize across environments.',
  'Track monthly mand rate. If rate drops >30% below peak, review motivation sources and re-implement intensive mand training procedures.'
),

(
  'Intraverbal Responses to "Wh-" Questions',
  'verbal_behavior',
  'Child will answer simple "What," "Where," and "Who" questions with relevant verbal responses.',
  'Trial-by-trial: Record + for correct intraverbal response, - for incorrect. Note question type (what/where/who). Calculate % correct per question type.',
  'Functional vocal or AAC communication; expressive vocabulary of 30+ words; receptive understanding of common nouns; manding established.',
  'Question cards or verbal scripts; preferred reinforcers; data sheet.',
  'Therapist asks a question relevant to the child''s experience (e.g., "What do you eat?" / "Where do you sleep?" / "Who reads you stories?").',
  'Child provides a relevant, contextually appropriate verbal or AAC response within 5 seconds.',
  'Child echoes the question, gives unrelated response, says "I don''t know" without attempting, or no response within 5 seconds.',
  'most_to_least',
  'Full verbal model → Partial verbal model (first word of answer) → Gestural cue → Indirect verbal prompt ("Think about...") → Independent.',
  'Interrupt incorrect response; provide correct verbal model; easy transfer trial; re-present original question. Reinforce only independent correct.',
  'Vary question format. Introduce questions from new communication partners. Transfer from structured table to natural conversation settings.',
  'VR2 for correct intraverbal; always deliver social praise. Tangible reinforcement on VR5 schedule once 80% accuracy is stable.',
  'Generalize across 3+ communication partners, home and school settings, and varied question contexts (food, people, places, activities).',
  'Re-probe monthly once mastered. Re-teach if accuracy falls below 75%. Include varied topics to prevent rote responding.'
),

(
  'Following Two-Step Directions',
  'verbal_behavior',
  'Child will correctly follow two-step verbal instructions delivered without gestural support.',
  'Trial-by-trial: Record + for both steps completed correctly in sequence, - if either step missed or reversed. Note prompt level.',
  'Follows single-step verbal directions with 90%+ accuracy; attends to speaker for 5+ seconds; basic receptive vocabulary of 20+ action words.',
  'Familiar classroom or therapy room items; instructions drawn from natural daily routines; data sheet.',
  'Therapist delivers two-step instruction in normal conversational tone: e.g., "Pick up the crayon and put it in the box."',
  'Child completes both steps in the correct sequence within 5 seconds of instruction, without additional prompting.',
  'Child completes only one step, reverses order, requires a repeated instruction, or does not initiate within 5 seconds.',
  'most_to_least',
  'Full gestural + verbal prompt → Gestural prompt only → Partial verbal repeat of missed step → Time delay → Independent.',
  'Stop child after error; calmly re-deliver instruction with appropriate prompt; complete transfer trial with known single-step direction; re-present two-step direction.',
  'Once mastered with trained instructions, introduce novel two-step directions. Vary settings (therapy room → classroom → home). Involve parents and teachers.',
  'FR1 during early instruction; thin to VR3 once 80% accuracy achieved. Natural reinforcement (access to activity) preferred where possible.',
  'Generalize with minimum 5 novel instruction sequences, 3 communicative partners, and 2 settings. Log generalization probe data monthly.',
  'Include two-step directions in daily maintenance probes. Re-teach if performance drops below 80% on two consecutive probe sessions.'
),

(
  'Echoic Training (Vocal Imitation)',
  'verbal_behavior',
  'Child will vocally imitate words or approximations modeled by the therapist.',
  'Trial-by-trial: Record + for correct imitation meeting criterion (exact or approved approximation), - for no response or incorrect attempt.',
  'Social attending; turns toward speaker when name called; no severe oral motor deficits (consult SLP if suspected); motivated by social or tangible reinforcement.',
  'Preferred items for motivation; mirror (optional); articulation criteria list approved by supervising BCBA; data sheet.',
  'Therapist establishes eye contact, says "Say [word/sound]" or "Say this," then models the target vocalization.',
  'Child produces a vocalization that meets the pre-defined approximation criterion within 3 seconds.',
  'Child produces an entirely different sound, remains silent, or echoes with significant delay (5+ seconds).',
  'most_to_least',
  'Partial physical (jaw tap) → Exaggerated model (elongated sounds) → Standard model → Faded model → Independent imitation.',
  'Re-model target sound; physically prompt mouth closure or jaw if needed; use easy transfer vocalization; re-present original target.',
  'Increase complexity of targets once criterion met. Transfer echoic responding to manding (use echoics to build new mands) and labeling programs.',
  'FR1 for all successful approximations during acquisition. Use high-value reinforcers. Thin to VR2 only after 5 consecutive sessions above 80%.',
  'Work with SLP on generalization to naturalistic conversation. Encourage parents to model and reward vocalizations at home. Log naturalistic vocal productions.',
  'Monthly probe of mastered targets. Re-teach using original echoic procedure if articulation criterion no longer met.'
),

-- ============================================================
-- DAILY LIVING SKILLS (5 goals)
-- ============================================================

(
  'Independent Hand Washing',
  'daily_living',
  'Child will independently complete all steps of hand washing with soap and water.',
  'Task analysis data: Record + or - for each step of the task analysis. Calculate % of steps completed independently per session.',
  'Tolerates water on hands; can stand at sink; basic gross and fine motor skills for squeezing and rubbing; no significant sensory aversions to soap (desensitize first if needed).',
  'Sink with running water; liquid soap dispenser; paper or cloth towel; visual task analysis posted at sink (optional); preferred reinforcers.',
  'Therapist says, "Go wash your hands," and moves to the sink area with the child. Natural cue: dirty hands or transition to meals.',
  'Child independently completes all task analysis steps in correct sequence: (1) Turn on water, (2) Wet hands, (3) Apply soap, (4) Lather 20 seconds, (5) Rinse, (6) Turn off water, (7) Dry hands.',
  'Child skips a step, completes steps out of order, refuses to engage with water or soap, or requires a verbal or physical prompt on any step.',
  'most_to_least',
  'Full physical chain → Partial physical (hand-over-hand on difficult steps only) → Gestural (point to next step) → Verbal (name next step) → Independent.',
  'Interrupt error immediately; prompt correct performance of the missed step; continue chain; do not restart the full sequence after an error unless safety requires it.',
  'Once child completes all steps independently in therapy setting, fade therapist proximity. Transfer to school bathroom and home bathroom with parent implementation.',
  'FR1 per completed chain initially. Deliver reinforcement at the end of the completed chain sequence. Thin to natural/social reinforcement once mastered.',
  'Target hand washing at natural times (before meals, after bathroom, after outside play) across clinic, home, and school settings with multiple caregivers.',
  'Monthly spot-check using task analysis. Re-teach any missed steps with prompting if accuracy falls below 90% on two checks.'
),

(
  'Putting On a T-Shirt Independently',
  'daily_living',
  'Child will independently dress themselves in a T-shirt using a complete task analysis.',
  'Task analysis data: + or - per step. Record prompt level for each step. Target 100% independent completion.',
  'Basic imitation of gross motor actions; tolerates clothing texture (address sensory concerns first); sitting balance on edge of bed or chair; emerging fine motor skills.',
  'Loose-fitting T-shirt (child''s own preferred shirt); chair or bed edge; reinforcer schedule; visual task analysis.',
  'Therapist lays the shirt in front of child with label facing down and says, "Put on your shirt."',
  'Child independently completes all steps: (1) Identify front of shirt, (2) Put head through neck hole, (3) Push one arm through sleeve, (4) Push other arm through sleeve, (5) Pull shirt down over torso.',
  'Child puts shirt on backwards, needs assistance with any step, or refuses to initiate.',
  'most_to_least',
  'Backward chaining with full physical prompt → Partial physical on problem steps → Gestural → Verbal → Independent.',
  'Interrupt error; physically guide child back to last correct step; prompt through error step; continue chain. Provide specific praise for correct steps.',
  'Train dressing in therapy room first. Transfer to bedroom setting. Involve parent for morning routine generalization. Vary shirt types (pullover, polo) once mastered.',
  'FR1 (preferred reinforcer) for completed dressing chain. Gradually shift to natural reinforcement (going outside, screen time) contingent on dressing.',
  'Practice with 3+ different shirt types, in bedroom and bathroom settings, with therapist and parent. Morning routine fading plan developed with family.',
  'Monthly dressing probe. Re-teach steps with errors. Full independence in natural morning routine is the ultimate maintenance goal.'
),

(
  'Brushing Teeth with Supervision',
  'daily_living',
  'Child will complete all tooth brushing steps independently with adult nearby for safety monitoring.',
  'Task analysis: + or - per step. Note steps requiring prompts. Aim for 100% independent completion of all steps.',
  'Tolerates toothbrush in mouth; tolerates toothpaste taste/texture (trial multiple flavors); basic fine motor grip; no significant oral aversion (address with OT/SLP if present).',
  'Child''s own toothbrush; preferred-flavor fluoride toothpaste; cup of water; sink; visual steps chart posted at mirror.',
  'Caregiver or therapist says, "Time to brush your teeth," at natural routine time (morning/bedtime).',
  'Child completes: (1) Get toothbrush, (2) Apply pea-size toothpaste, (3) Brush upper front/back, (4) Brush lower front/back, (5) Spit, (6) Rinse mouth, (7) Rinse brush, (8) Return brush.',
  'Child refuses toothbrush, skips brushing areas, spits prematurely, needs redirection on any step.',
  'most_to_least',
  'Hand-over-hand physical guidance → Partial physical on specific steps → Gestural (mirror modeling) → Verbal step reminders → Independent.',
  'Interrupt and re-prompt missed step; do not complete sequence for child; keep tone calm and neutral; continue chain after correction.',
  'Build from one setting (clinic sink) to home bathroom. Transfer to parents with step-by-step coaching. Fade visual supports once routine is established.',
  'Access to preferred activity immediately after completing full brushing routine. Thin to natural routine reinforcement (bedtime story, screen time).',
  'Generalize to morning and bedtime routines. Practice in hotel or school bathrooms when possible. Involve all caregivers in consistent implementation.',
  'Monthly parent-reported probe. Re-teach missed steps. Goal is fully independent routine with zero adult prompts by end of Phase 2.'
),

(
  'Using a Spoon to Self-Feed',
  'daily_living',
  'Child will use a spoon to scoop and deliver food to their mouth independently during meals.',
  'Frequency/percentage: Record number of independent scoops vs. prompted scoops per meal. Target 90% independent.',
  'Tolerates food textures; basic sitting position at table; no significant oral motor feeding difficulties (consult OT if suspected); emerging pincer or palmer grasp.',
  'Adaptive spoon (built-up handle if needed); preferred semi-solid food (applesauce, yogurt, oatmeal); plate with raised edge; non-slip mat; bib; reinforcer.',
  'Food is placed in front of child during meal time. Natural SD: presence of food and spoon at meal. Therapist says, "Eat your [food]," if needed.',
  'Child grips spoon, scoops food from bowl, lifts spoon to mouth, and eats without spilling more than 25% of the scoop.',
  'Child refuses spoon, uses hands instead, drops spoon, requires hand-over-hand on any component, or throws food.',
  'most_to_least',
  'Hand-over-hand full guidance → Wrist guidance only → Elbow tap to prompt lift → Gestural (point to spoon) → Independent.',
  'Gently guide hand back to spoon if child drops or uses hands. Re-model scoop. Avoid removing food as punishment. Keep mealtime calm.',
  'Fade from adaptive spoon to standard spoon once mastered. Generalize to different food textures, different meal settings, and different caregivers.',
  'FR1 (verbal praise + continued meal access) for each successful independent scoop. Natural reinforcement of preferred food is inherent.',
  'Practice self-feeding during all meals across home and school. Train all feeding adults on consistent prompting procedure. Log meal independence weekly.',
  'Monthly probe at natural meal. Report to OT if regression. Consider food variety expansion once self-feeding is fully independent.'
),

(
  'Toilet Training: Requesting to Use Bathroom',
  'daily_living',
  'Child will independently communicate the need to use the bathroom prior to elimination.',
  'Frequency count: Record each unprompted request, each prompted request, and each accident. Calculate ratio of requests to accidents.',
  'Regular toileting schedule established; child has demonstrated partial or full elimination in toilet; basic communication (verbal, sign, or AAC); sitting on toilet without behavioral distress.',
  'Toilet with step stool if needed; AAC device or bathroom picture card; preferred reinforcer for successful request + elimination; dry pants check chart.',
  'Natural establishing operation: scheduled time intervals (every 30-60 min) and physiological cues. Therapist may ask, "Do you need to go potty?" as a faded prompt.',
  'Child independently approaches caregiver, activates AAC symbol, uses sign, or vocalizes bathroom request before an accident occurs.',
  'Child has accident without communicating need; child makes no communicative attempt even when visibly uncomfortable; child refuses toilet.',
  'least_to_most',
  'Scheduled prompted trips (every 30 min) → Indirect verbal prompt ("What do you need?") → Direct prompt ("Tell me you need the bathroom") → Full verbal model → Independent request.',
  'After any accident, neutral response; prompt child to bathroom; re-establish schedule. Avoid scolding. Increase schedule frequency if accidents occur.',
  'Fade scheduled trips from every 30 min to every 60 min to child-initiated once request rate is stable. Generalize to school, community, and unfamiliar bathrooms.',
  'Immediate access to bathroom + high-value reinforcer for every successful request followed by elimination. Maintain enthusiastic praise.',
  'Implement consistent procedure across home, school, and community settings. Brief all caregivers. Conduct school visit to train staff.',
  'Track request/accident ratio weekly. If accidents increase, return to scheduled prompts. Full independent toileting is the long-term maintenance goal.'
),

-- ============================================================
-- SOCIAL SKILLS (5 goals)
-- ============================================================

(
  'Greeting Others (Hello/Hi)',
  'social_skills',
  'Child will independently greet a familiar person with a verbal or gestural greeting upon approach or when greeted.',
  'Frequency per session: Record spontaneous greetings vs. prompted greetings. Target 4+ spontaneous greetings per session.',
  'Attends to and recognizes familiar people; some emerging vocal behavior or AAC use; no severe aversion to social proximity.',
  'Familiar adults and peers as social partners; no specific materials required; AAC device if applicable.',
  'Natural SD: Familiar person enters the room or approaches child. Therapist may use role-play scenarios initially.',
  'Child says "Hi," "Hello," or uses equivalent sign/AAC within 3 seconds of person approaching or greeting child.',
  'Child ignores person, turns away, echoes greeting prompt, or only responds when physically redirected toward person.',
  'least_to_most',
  'Gestural prompt (wave toward person) → Indirect verbal ("What do we say?") → Partial verbal ("Hi...") → Full verbal model ("Say Hi, [name]") → Independent.',
  'If child does not respond, prompt immediately with full model; provide enthusiastic social reinforcement; conduct easy social exchange before re-presenting greeting opportunity.',
  'Generalize to multiple familiar adults, peers, and family members. Practice in hallway greetings, arrival at therapy, and community settings. Involve parents.',
  'VR2 for prompted greeting; enthusiastic social praise for every greeting. Do not withhold access for failure to greet — social greetings must remain positive.',
  'Implement greeting practice at natural transitions across school, home, and community. Include peers as greeting partners once adults are mastered.',
  'Observe frequency of spontaneous community greetings monthly. Provide booster sessions if prompted-to-spontaneous ratio worsens.'
),

(
  'Taking Turns During a Simple Game',
  'social_skills',
  'Child will wait for their turn and take appropriate action during a structured 2-person game.',
  'Frequency: Record number of turns taken correctly vs. turns requiring prompts. Record instances of grabbing or turn-taking refusals.',
  'Basic sitting for 5+ minutes; tolerates others touching shared materials; no significant aggressive behavior toward shared items; understands simple win/lose concept is not required.',
  'Simple turn-taking game (Connect Four, Uno, rolling a ball, Candy Land); timer or turn indicator; preferred reinforcer.',
  'Therapist sets up game and says, "It''s my turn / your turn." Natural SD: visible turn sequence of game.',
  'Child waits appropriately while therapist takes their turn, then takes own turn when verbally or visually cued, without grabbing or agitating.',
  'Child grabs pieces during partner''s turn, leaves the game, has tantrum related to game outcomes, or requires multiple prompts to wait.',
  'least_to_most',
  'Visual turn indicator (card or object) → Gestural prompt (point to self or partner) → Indirect verbal ("Whose turn is it?") → Direct verbal ("Wait/your turn now") → Independent.',
  'Retrieve grabbed items neutrally; re-set turn with visual cue; continue game. Avoid reprimanding — briefly explain rule and continue.',
  'Begin with 1:1 therapist. Add parent to the game. Transition to peer partner in clinic, then classroom. Vary games as skills build.',
  'FR1 during early acquisition; every correct turn exchange earns praise + small reward. Thin to end-of-game reinforcer once turn-taking is stable.',
  'Practice turn-taking across 3+ different games, with 3+ different partners, and in classroom/home settings. Include peer play dates.',
  'Monthly report from school or home on turn-taking behavior in natural play. Coach teachers and parents on consistent turn-indicating strategies.'
),

(
  'Responding to Name',
  'social_skills',
  'Child will look toward the person calling their name within 3 seconds.',
  'Trial-by-trial: Record + for look within 3 sec, - for no response or delayed response (>3 sec). Record latency for baseline comparison.',
  'No specific prerequisites; target this goal early in programming. Check hearing if child consistently does not respond.',
  'No materials needed; use natural environment; preferred reinforcers.',
  'Therapist or caregiver calls child''s name once in a neutral tone from 3–6 feet away. No additional cues or prompts in the SD.',
  'Child turns head toward the caller and makes brief eye contact or orients face within 3 seconds of name being called.',
  'Child does not orient toward caller, continues current activity without acknowledging, or only responds after name is repeated 2+ times.',
  'most_to_least',
  'Light physical prompt (tap shoulder) → Gestural (wave hand in visual field) → Second name call at closer distance → Time delay → Independent.',
  'After no response: tap shoulder, re-call name, prompt orientation, deliver high-value reinforcer for oriented response. Gradually fade prompts.',
  'Train across multiple natural callers (therapist, parent, teacher, sibling). Vary proximity, room, and activity context.',
  'FR1 with high-value reinforcer for every response during acquisition. Thin to social praise + occasional tangible on VR5 once mastered.',
  'Generalize across 5+ people, in 3+ settings, during both quiet and moderately noisy environments. Monthly probe at home and school.',
  'Track in natural settings monthly. Re-teach if response latency increases or frequency drops. Consider environmental modifications if background noise is a barrier.'
),

(
  'Sharing Materials with a Peer',
  'social_skills',
  'Child will hand a requested item to a peer or offer an item from a shared set when prompted or in natural play.',
  'Frequency: Count sharing instances per session (prompted vs. spontaneous). Target 3+ spontaneous shares per 30-minute session.',
  'Basic turn-taking skills established; tolerates peer proximity; no severe aggression toward peers; emerging parallel play.',
  'Preferred shared materials (crayons, blocks, Play-Doh); 2 sets to prevent deprivation conflicts; peer partner; reinforcers.',
  'Peer or therapist says, "Can I have the [item]?" or during play activity, natural opportunity to share arises.',
  'Child hands item to requesting peer within 5 seconds, without aggression or significant protest.',
  'Child hoards items, turns away from peer, pushes peer, cries/protests for more than 10 seconds, or requires physical prompt to release item.',
  'least_to_most',
  'Gestural (hand cupped toward peer) → Indirect verbal ("What does [peer] need?") → Direct verbal ("Give [peer] the crayon") → Physical guidance → Independent.',
  'Prevent conflict by ensuring ample supply of materials initially. Calmly redirect; prompt sharing; provide reinforcement. Debrief only briefly.',
  'Fade from adult-facilitated sharing to child-initiated. Move from structured table activities to free play. Integrate peer without disabilities as model.',
  'FR1 (enthusiastic praise + token) for every share. Token board for 5 shares → preferred activity. Thin token schedule over sessions.',
  'Generalize to classroom free-play, lunchroom, home with siblings, and community play areas. Brief school staff on sharing reinforcement procedures.',
  'Monthly teacher report. Observe 1 natural play session per month. Coach parents for sibling play situations.'
),

(
  'Initiating Play with a Peer',
  'social_skills',
  'Child will independently approach a peer and initiate a play activity using words, gestures, or AAC.',
  'Frequency per session: Count unprompted initiations vs. prompted initiations. Target 2+ spontaneous initiations per 20-minute play session.',
  'Basic turn-taking and sharing skills; tolerates peer proximity; some expressive communication; motivated by social play.',
  'Preferred play activities (blocks, cars, board games); peer partner (familiar); AAC if applicable.',
  'Natural play environment is the SD. Child is in proximity to peer with preferred materials available.',
  'Child approaches peer within arm''s reach and uses verbal phrase ("Want to play?"), gesture (holds up toy toward peer), or AAC to invite play.',
  'Child plays alone, watches peer without engaging, initiates with aggressive action (grabbing), or requires multiple adult prompts.',
  'least_to_most',
  'Gestural prompt (guide toward peer, point to activity) → Indirect verbal ("What could you do with [peer]?") → Script prompt → Full verbal model → Independent.',
  'If peer interaction becomes negative: intervene neutrally; redirect to positive parallel activity; praise any positive peer-directed behavior.',
  'Begin with adult as play partner, then transition to familiar peer, then to unfamiliar peer. Vary play contexts (structured → unstructured).',
  'Enthusiastic social praise + token for every initiation. Peer''s positive response is a natural reinforcer — set up activities to ensure peer responds positively.',
  'Generalize to recess, lunchroom, after-school activities, and home play dates. Fade adult presence systematically.',
  'Monthly observation of natural peer play. Report from teacher. Fade structured support as generalized spontaneous initiation is documented.'
),

-- ============================================================
-- ACADEMIC SKILLS (5 goals)
-- ============================================================

(
  'Matching Identical Objects',
  'academic',
  'Child will match an identical object or picture to its corresponding sample in a field of 3.',
  'Trial-by-trial: Record + for correct independent match, - for incorrect or prompted. Track % correct per session.',
  'Visual attending; basic fine motor skills for placing objects; no severe visual impairment; sitting for structured task.',
  '3 identical pairs of common objects or picture cards; table; non-slip mat; reinforcers.',
  'Therapist places 3 items in a row, hands child a matching item, and says, "Match" or "Put it with the same one."',
  'Child places the sample item on or next to its identical counterpart within 5 seconds, independently.',
  'Child places item on incorrect target, drops item, throws item, or requires gestural/physical prompt.',
  'most_to_least',
  'Full physical hand-over-hand → Wrist guidance to correct location → Gestural (point to correct target) → Time delay → Independent.',
  'Remove sample from incorrect location; re-present with prompt; easy transfer trial; re-present matching task. Reinforce independent placement only.',
  'Vary item types (3D objects → photos → illustrations → abstract shapes). Expand field size from 3 to 5. Introduce non-identical matching once identical is mastered.',
  'FR1 per correct match during acquisition. Thin to FR3 once 80% across 3 sessions, then VR5 at mastery.',
  'Generalize with novel untrained item sets. Vary color and size of matching items. Implement in classroom "sorting" activities.',
  'Monthly probe with novel item sets. Re-teach if below 80%. Extend skills toward sorting, categorizing, and non-identical matching programs.'
),

(
  'Identifying Colors (Red, Blue, Yellow, Green)',
  'academic',
  'Child will receptively identify and expressively label 4 basic colors.',
  'Trial-by-trial: Record + or - per trial. Track separate data for receptive (touch) and expressive (label) responses. % correct per color.',
  'Basic receptive discrimination; visual attending; some expressive vocabulary; matching to sample of colors established.',
  'Colored cards or objects in target colors (red, blue, yellow, green); white background cards; preferred reinforcers.',
  'Receptive: Place 4 color cards in front of child; say "Touch [color]." Expressive: Hold up single color card; say "What color is this?"',
  'Receptive: Child touches correct color card. Expressive: Child says or indicates correct color name within 3 seconds.',
  'Touches wrong color; says wrong color name; echoes "What color is this?"; no response in 3 seconds.',
  'most_to_least',
  'Full physical → Gestural (point to correct card) → Verbal color name prompt (expressive) → Time delay → Independent.',
  '4-Step Error Correction: Block response; provide correct answer; transfer trial; re-present original trial. Reinforce only independent correct.',
  'Introduce one color at a time using errorless teaching, then add field discrimination. Transfer from cards to objects in the environment.',
  'FR1 during acquisition. Thin to VR3 at mastery. Social praise always accompanies tangible reinforcers.',
  'Generalize by labeling colors in clothing, food, toys, and books. Request colors during natural activities ("Get the red cup").',
  'Monthly probe with novel colored objects. Re-teach any color falling below 80%. Expand color vocabulary to secondary colors.'
),

(
  'Counting Objects 1–10',
  'academic',
  'Child will touch and count a set of 1–10 objects with one-to-one correspondence and report the total.',
  'Trial-by-trial per set size: Record + for correct count with correct total, - for skip/double-count or incorrect total. Track % per number range (1-5, 6-10).',
  'Can rote count to 10 (verbal chain); basic fine motor pointing; attention for sequential task; visual tracking.',
  'Small manipulatives (blocks, chips, bears); counting mat; sets pre-arranged in rows of up to 10; reinforcers.',
  'Therapist places a set of objects and says, "Count these and tell me how many."',
  'Child touches each object once in sequence, says corresponding number, and states the total ("There are [N]").',
  'Child skips objects, double-counts, loses place, or states incorrect total.',
  'most_to_least',
  'Full physical (hand-over-hand pointing) → Partial physical (guide only first item) → Gestural (point alongside child) → Verbal cue ("Keep going") → Independent.',
  'Move miscounted objects aside; re-present set; guide re-count; easy transfer with smaller set; re-present original. Reinforce correct total only.',
  'Increase set size gradually (1→3→5→10). Move from rows to scattered arrangements. Transfer to counting objects in the environment (books on shelf, chairs).',
  'FR1 for every correct count with correct total. High-enthusiasm praise for independent counting. Tangible on VR5 schedule.',
  'Generalize counting to daily routines (count snack pieces, count steps, count toys to put away). Involve parents and teachers.',
  'Monthly probes with novel object sets. Introduce simple addition/subtraction once 1-10 counting is mastered across 2+ settings.'
),

(
  'Identifying Letters of the Alphabet (Receptive)',
  'academic',
  'Child will touch the named letter from a field of 4 upper-case letter cards.',
  'Trial-by-trial: Record + or - per trial per letter. Calculate % correct per letter and overall. Track with rotating field.',
  'Basic matching to sample with letters; visual attending; no significant visual processing concerns; sitting for structured task.',
  'Upper-case letter cards; table; data sheet; preferred reinforcers.',
  'Therapist places 4 letter cards in front of child and says, "Touch [letter name]."',
  'Child touches the correct letter within 3 seconds, independently.',
  'Child touches wrong letter or does not respond within 3 seconds.',
  'most_to_least',
  'Full physical → Gestural (point near correct letter) → Verbal comparison cue → Time delay → Independent.',
  '4-Step Error Correction. Rotate field position of letters to prevent position-based responding.',
  'Introduce letters in sets of 3-4 using errorless teaching before testing. Expand field. Transfer to environmental print (signs, books).',
  'FR1 per correct identification during acquisition; thin to VR5 at mastery.',
  'Generalize to print in books, alphabet puzzles, classroom alphabet strip, and computer keyboard.',
  'Monthly probe with full alphabet field. Expand to letter-sound correspondence once receptive identification of all 26 letters is mastered.'
),

(
  'Writing First Name',
  'academic',
  'Child will independently write their first name with legible letters in correct sequence.',
  'Task analysis per letter: Record + or - for each letter written legibly and in sequence. Calculate % of name written independently.',
  'Can hold and control a pencil with 3-finger grasp; can imitate horizontal and vertical strokes; has fine motor skills for basic shapes; no significant grip difficulties (consult OT if needed).',
  'Pencil; name tracing card with guide dots; unlined paper; preferably a tabletop with non-slip mat; reinforcers.',
  'Therapist places paper and pencil in front of child and says, "Write your name."',
  'Child writes all letters of first name in correct sequence with legible formation, without needing a model or tracing guide.',
  'Child writes letters in wrong order, reverses letters significantly, skips letters, or requires tracing for any letter.',
  'most_to_least',
  'Tracing over model → Tracing over dots → Copy from model below → Copy from model on different paper → Independent recall.',
  'Cover incorrect letter; guide child''s hand to re-form letter correctly; continue sequence; do not erase child''s work in front of them.',
  'Fade tracing support letter by letter (most difficult letters last). Transfer to writing on lined paper, then to digital typing as generalized name identification.',
  'FR1 (high-value reinforcer) for first independent name writing. Thin to social praise + special privilege for correct name on schoolwork.',
  'Generalize to writing name on homework, artwork, name tags, birthday cards. Practice across school desk, clipboard, and whiteboard surfaces.',
  'Monthly handwriting probe. Consult OT if letter formation difficulties persist despite adequate practice. Fade all writing supports by end of kindergarten equivalent.'
),

-- ============================================================
-- BEHAVIOR REDUCTION (4 goals)
-- ============================================================

(
  'Reducing Tantrum Behavior',
  'behavior_reduction',
  'Decrease frequency and duration of tantrum behavior (crying, screaming, dropping to floor) when a preferred item is denied or a demand is placed.',
  'Frequency count per session: Record number of tantrum episodes and duration of each. Track antecedent (demand vs. denial vs. transition). Graph weekly trend.',
  'Functional behavior assessment (FBA) completed; function of tantrum identified; alternative communication or coping response selected; reinforcement of alternative behavior established.',
  'Timer; tantrum data sheet with antecedent/behavior/consequence (ABC) columns; preferred items for reinforcing replacement behavior; visual "first-then" board.',
  'Natural antecedents: demand placed, preferred item removed, or non-preferred transition initiated. Do not artificially provoke tantrums for practice.',
  'Child accepts the demand, denial, or transition within 30 seconds using the replacement behavior (requesting a break, taking 3 deep breaths, or accepting "no" card).',
  'Child engages in crying, screaming, dropping to floor, or throwing items for more than 30 seconds following the antecedent.',
  'least_to_most',
  'Pre-teach replacement behavior during calm periods → Prompt use of replacement behavior at first sign of distress → Redirect and wait → Planned ignoring of tantrum → Independent use of replacement skill.',
  'Do not provide the denied item or remove the demand during a tantrum (avoid inadvertent reinforcement of escape/access function). Wait for calm, then re-present.',
  'Once replacement behavior is established in session, implement identical procedures at home and school. Provide ABC data collection tools to all caregivers.',
  'Dense reinforcement schedule for use of replacement behavior (FR1 during early training). Frequent reinforcement during low-demand periods to build positive context.',
  'Consistent implementation across ALL settings and ALL caregivers is critical. Hold weekly briefing with parents and teachers. No exceptions to extinction procedure.',
  'Track frequency and duration trends monthly. Conduct a new FBA if extinction burst occurs without reduction over 3 weeks. Re-evaluate reinforcement menu regularly.'
),

(
  'Reducing Elopement (Running from Adults)',
  'behavior_reduction',
  'Decrease frequency of running away from designated supervised areas without permission.',
  'Frequency count per observation period: Record each elopement instance and context. Note antecedent, duration, and distance traveled. Target 0 elopements per session.',
  'FBA completed; function identified (escape, sensory, attention, access); environmental modifications in place; safety plan established; alternative communication for requesting breaks.',
  'Visual boundary markers (carpet squares, tape on floor); "stop" signal card; reinforcer for staying in area; safety barriers in early training (if clinically indicated).',
  'Natural SD: transition to new area, end of preferred activity, or presence of non-preferred demand in the environment.',
  'Child remains in designated area or communicates a request to move (raises hand, uses AAC, gives "break" card) when desire to leave arises.',
  'Child moves beyond designated boundary without communicative attempt or permission.',
  'most_to_least',
  'Immediate physical block (safety first) → Visual boundary reminders → Anticipatory prompt before transitions → Non-contingent reinforcement in area → Independent staying.',
  'Safety first: calmly retrieve child. Neutral tone — no reinforcing attention. Return child to area. Re-deliver demand or continue routine. Do not chase or react dramatically.',
  'Practice boundary-staying in progressively less-structured environments. Train all staff on safety retrieval procedure. Conduct risk assessment and update safety plan monthly.',
  'High-density reinforcement (FR1) for remaining in designated area, especially during historically difficult antecedent conditions. Enriched environment to reduce escape motivation.',
  'Coordinate with school on identical boundary and reinforcement procedures. Provide parents with written safety protocol. Review safety plan with new staff immediately.',
  'Monthly elopement frequency data review. If elopement occurs in community, implement supervision protocols (hand-holding, wrist link) until self-management is demonstrated.'
),

(
  'Reducing Self-Injurious Behavior (Head-Hitting)',
  'behavior_reduction',
  'Decrease frequency of self-injurious head-hitting to zero or near-zero occurrences per session.',
  'Frequency count per session: Record every instance of head-hitting. Note antecedent, duration, and setting. Graph weekly. Requires BCBA active oversight.',
  'BCBA-led FBA completed; medical evaluation for pain/medical causes ruled out; function identified; safety plan in place; crisis protocol established; guardian consent for data collection.',
  'Data sheet with ABC format; protective equipment if indicated by BCBA and medical team; preferred items for reinforcing alternative behavior; visual schedule to reduce uncertainty.',
  'Natural antecedents (identified via FBA): may include transitions, demands, sensory stimulation, or attention. Do NOT provoke behavior for teaching purposes.',
  'Child remains engaged in activity or uses appropriate communication (requesting break, using sensory tool) when antecedent conditions arise, with zero head-hitting.',
  'Child strikes head with hand or object, or strikes head against hard surface. Any instance constitutes a data point.',
  'most_to_least',
  'BCBA-directed only: response blocking (with protective positioning) → Immediate redirection to sensory alternative → Non-contingent reinforcement schedule → Functional communication training.',
  'Response blocking per BCBA safety protocol. Neutral face and body. Re-present activity or transition after brief calm period. Never reinforce with escape unless escape is the prescribed treatment.',
  'Written behavior intervention plan (BIP) required. All staff trained and signed off on BIP. In-home parent training sessions. Quarterly BIP review.',
  'Non-contingent reinforcement on a dense schedule to reduce overall deprivation. High reinforcement rates for alternative behaviors. Review reinforcer potency weekly.',
  'BIP must be implemented identically across clinic, school, and home with zero deviations. Monthly team meeting to review data and adjust plan. BIP on file at school.',
  'Weekly data review by BCBA required. Increase supervision if rate is increasing. Consult medical team if rate does not respond to behavioral intervention within 4 weeks.'
),

(
  'Reducing Aggressive Behavior Toward Peers',
  'behavior_reduction',
  'Decrease frequency of physical aggression (hitting, biting, scratching) toward peers to zero occurrences per session.',
  'Frequency count per session: Record each aggression instance (type, peer, antecedent, consequence). Target 0 per session over 10 consecutive sessions.',
  'BCBA-led FBA completed; function identified; social skills program active; replacement behavior (requesting space, using words) established; peer safety protocols in place.',
  'ABC data sheet; visual "stop" or "space" card; safe zone designated in environment; social story for identified antecedent situations.',
  'Natural antecedents (per FBA): peer proximity, shared materials, unstructured time, unexpected touch. Structured role-play used for skill teaching, not provocation.',
  'Child uses replacement behavior (verbal request, space card, walks away) when peer interaction becomes distressing. Zero physical contact with aggressive intent.',
  'Child strikes, bites, or scratches a peer, regardless of provocation level.',
  'most_to_least',
  'Anticipatory blocking and redirection → Proximity prompt before antecedent escalates → Verbal self-management cue ("What do I do?") → Independent use of replacement behavior.',
  'Protect peer first; calmly separate child; neutral tone; re-route to safe activity. Do not discuss during behavior. Brief social coaching only after full calm is achieved.',
  'Generalization of replacement behavior required across all social settings before structured peer time is expanded. Peer sensitivity training if applicable.',
  'Dense reinforcement of prosocial peer interactions and use of replacement behavior. Review reinforcement schedule weekly. Peer play access contingent on replacement behavior use.',
  'School-home-clinic coordination required. BIP on file at school. Monthly team meeting. Alert all staff to identified antecedents.',
  'Weekly review of aggression frequency data. If no reduction in 3 weeks, revisit FBA. Conduct quarterly social validity check with family.'
),

-- ============================================================
-- IMITATION (4 goals)
-- ============================================================

(
  'Gross Motor Imitation',
  'imitation',
  'Child will imitate gross motor actions modeled by the therapist within 3 seconds of the model.',
  'Trial-by-trial: Record + for correct imitation within 3 seconds, - for incorrect or no response. Calculate % correct per session.',
  'Visual attending to therapist; willingness to engage at table or standing task; no significant motor impairments limiting gross motor movement (consult PT if needed).',
  'Open floor space or table; no materials required for basic actions; optional props for advanced targets (ball, drum, hoop).',
  'Therapist says "Do this" and performs a gross motor action (arms up, stomp feet, clap, jump, touch head).',
  'Child performs the same action as the therapist within 3 seconds, with at least partial accuracy.',
  'Child performs a different action, freezes, or remains unresponsive for more than 3 seconds.',
  'most_to_least',
  'Full physical guidance → Partial physical (initial movement only) → Gestural (point to body part) → Verbal label of action → Independent.',
  'Stop child''s incorrect action; physically guide correct action; easy transfer trial (known imitated action); re-present original model.',
  'Once 10+ actions are imitated, introduce novel actions during probe sessions to assess generalized imitation. Transfer to peer modeling.',
  'FR1 during acquisition. Thin to VR2 once 80%+ across sessions. Social praise always delivered.',
  'Generalize with different therapists performing the models. Include functional actions tied to daily routines (clapping, waving). Practice in front of mirror.',
  'Monthly generalized imitation probes with novel untrained actions. Target generalized imitation as the overarching milestone.'
),

(
  'Fine Motor Imitation',
  'imitation',
  'Child will imitate fine motor actions with hands and fingers modeled by the therapist.',
  'Trial-by-trial: Record + for correct imitation within 3 seconds, - for incorrect or no response.',
  'Basic gross motor imitation established; adequate fine motor control; visual attending to hand movements; tolerates close proximity of therapist hands.',
  'Table; optional props (blocks, pegs, coins, clay); clear sightline to therapist''s hands.',
  'Therapist places hands in view of child, says "Do this," and performs fine motor action (finger point, open/close hand, tap table, pinch, make fist).',
  'Child performs the same fine motor action as the therapist within 3 seconds.',
  'Child performs different hand action or does not respond within 3 seconds.',
  'most_to_least',
  'Full physical guidance of hand position → Partial physical → Gestural (point to hand) → Verbal label ("make a fist") → Independent.',
  'Gently redirect hands to correct position; easy transfer trial; re-present original model.',
  'Generalize to object manipulation (stacking block after seeing therapist stack). Link fine motor imitation to tool use and self-care tasks.',
  'FR1 per correct imitation. High-value reinforcer for first successful imitation of novel actions.',
  'Practice across therapists. Link to OT goals. Introduce peer as model once therapist imitation is at 90%.',
  'Monthly novel action probe. Coordinate with OT on fine motor development trajectory.'
),

(
  'Object Imitation',
  'imitation',
  'Child will imitate an action performed with an object after watching the therapist demonstrate.',
  'Trial-by-trial: Record + for correct object imitation, - for incorrect or no response.',
  'Gross and fine motor imitation established; willingness to interact with objects; no strong object aversion.',
  'Common objects with clear functional actions (drum and stick, cup and spoon, ball, stacker); duplicates for therapist and child.',
  'Therapist performs action with object (bangs drum, stirs with spoon, stacks block) and says "Do this." Child has identical materials.',
  'Child performs the same action with the same or equivalent object within 5 seconds.',
  'Child performs different action with object, mouths/throws object, or ignores materials.',
  'most_to_least',
  'Physical guidance through action → Partial physical on initiation only → Gestural → Verbal label of action → Independent.',
  'Redirect from off-task behavior; physically guide correct action; easy transfer trial; re-present.',
  'Expand to sequences of 2 object actions. Transfer to functional play (feeding doll, making pretend food). Link to daily living tasks.',
  'FR1 during acquisition. Use preferred objects as materials and their manipulation as inherent reinforcement.',
  'Generalize with novel objects. Practice in play area, not only at table. Include peer demonstration.',
  'Monthly probe with novel object-action combinations. Extend to pretend play programs once generalized object imitation is established.'
),

(
  'Imitating Peer Models',
  'imitation',
  'Child will imitate actions demonstrated by a same-age peer during structured activities.',
  'Frequency: Record instances of child imitating peer (prompted vs. spontaneous) during peer interaction sessions.',
  'Gross motor, fine motor, and object imitation established with adults; tolerates peer proximity; no significant aggression toward peers.',
  'Structured activity with clear actions to imitate; peer model trained on how to demonstrate actions; parallel play materials.',
  'Peer performs an action with a shared material in a structured activity. Natural SD is peer''s behavior; adult may narrate ("Look what [peer] is doing").',
  'Child watches peer and performs the same or similar action within 10 seconds, without adult physical prompting.',
  'Child ignores peer, copies adult instead of peer, or only imitates after repeated adult prompting.',
  'least_to_most',
  'Adult verbal narration ("Look, [peer] is building") → Indirect prompt ("What is [peer] doing?") → Direct verbal → Gestural toward peer → Independent.',
  'Draw attention back to peer; narrate peer action; prompt imitation; provide enthusiastic praise for any peer-directed attention.',
  'Transfer from structured parallel play to cooperative play. Increase unstructured peer time as peer imitation becomes spontaneous.',
  'Social reinforcement (praise, peer''s positive response) is the primary reinforcer. Supplement with tokens initially.',
  'Target peer imitation in classroom, playground, and home with siblings. Fade adult narration progressively.',
  'Monthly naturalistic observation of peer imitation in classroom. Report from teacher. Coordinate with school inclusion support.'
);
