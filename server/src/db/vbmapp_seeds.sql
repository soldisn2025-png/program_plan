-- VB-MAPP Milestones Seed File
-- 240 milestones across 16 domains, 3 levels, 5 milestones per level
-- Domains: Mand, Tact, Listener Responding, VP/MTS, Independent Play,
--          Social Behavior, Motor Imitation, Echoic, LRFFC, Intraverbal,
--          Classroom Routines, Linguistic Structure, Reading, Writing, Math, Spelling

CREATE TABLE IF NOT EXISTS vbmapp_milestones (
  id              SERIAL PRIMARY KEY,
  domain          VARCHAR(100) NOT NULL,
  level           INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  milestone_number INTEGER NOT NULL,
  milestone_code  VARCHAR(20) NOT NULL UNIQUE,
  milestone_name  TEXT NOT NULL
);

INSERT INTO vbmapp_milestones (domain, level, milestone_number, milestone_code, milestone_name) VALUES

-- ============================================================
-- MAND (Requesting)
-- ============================================================
('Mand', 1, 1,  'MND-1',  'Spontaneously emits at least 2 different mands without prompting or echolalia'),
('Mand', 1, 2,  'MND-2',  'Mands for 5 different reinforcers using vocal, sign, or AAC without prompts'),
('Mand', 1, 3,  'MND-3',  'Mands for 10 different reinforcers across at least 3 different settings'),
('Mand', 1, 4,  'MND-4',  'Emits a mand in response to an establishing operation without additional prompts'),
('Mand', 1, 5,  'MND-5',  'Mands for 20 or more different items, actions, or people across the day'),
('Mand', 2, 6,  'MND-6',  'Mands using 2-word combinations such as "more juice" or "want cookie"'),
('Mand', 2, 7,  'MND-7',  'Mands for a missing item needed to complete a task or activity'),
('Mand', 2, 8,  'MND-8',  'Mands for information using "what" or "where" questions spontaneously'),
('Mand', 2, 9,  'MND-9',  'Mands for 50 or more different reinforcers with minimal prompting'),
('Mand', 2, 10, 'MND-10', 'Mands using adjectives to specify desired items such as "big ball" or "red cup"'),
('Mand', 3, 11, 'MND-11', 'Mands using complete sentences of 3 or more words spontaneously'),
('Mand', 3, 12, 'MND-12', 'Mands for information using why, how, and when questions'),
('Mand', 3, 13, 'MND-13', 'Mands to terminate or avoid non-preferred activities using appropriate language'),
('Mand', 3, 14, 'MND-14', 'Mands with 200 or more different words across various sentence structures'),
('Mand', 3, 15, 'MND-15', 'Uses mands to direct others behavior and initiate social interactions'),

-- ============================================================
-- TACT (Labeling)
-- ============================================================
('Tact', 1, 1,  'TAC-1',  'Tacts 5 different items without prompts when item is presented'),
('Tact', 1, 2,  'TAC-2',  'Tacts 10 different items across multiple settings and people'),
('Tact', 1, 3,  'TAC-3',  'Tacts 2 or more actions such as running or eating when demonstrated'),
('Tact', 1, 4,  'TAC-4',  'Tacts 20 or more items from at least 4 different categories'),
('Tact', 1, 5,  'TAC-5',  'Tacts items from pictures or photographs with 80% or greater accuracy'),
('Tact', 2, 6,  'TAC-6',  'Tacts 50 or more items across multiple categories without prompts'),
('Tact', 2, 7,  'TAC-7',  'Tacts attributes of items including color, size, and shape'),
('Tact', 2, 8,  'TAC-8',  'Tacts actions in pictures using correct verb labels'),
('Tact', 2, 9,  'TAC-9',  'Tacts locations and prepositions such as on, under, and next to'),
('Tact', 2, 10, 'TAC-10', 'Tacts private events such as emotions and physical states like hungry or tired'),
('Tact', 3, 11, 'TAC-11', 'Tacts items by function such as "you use it to cut" or "you write with it"'),
('Tact', 3, 12, 'TAC-12', 'Tacts 200 or more items with correct labels across naturalistic settings'),
('Tact', 3, 13, 'TAC-13', 'Tacts categories and subcategories of items when presented'),
('Tact', 3, 14, 'TAC-14', 'Tacts environmental events and sequences such as seasons and daily routines'),
('Tact', 3, 15, 'TAC-15', 'Tacts novel stimuli and generalizes labels to untrained items in new settings'),

-- ============================================================
-- LISTENER RESPONDING
-- ============================================================
('Listener Responding', 1, 1,  'LR-1',  'Selects the correct item from an array of 2 when item is named'),
('Listener Responding', 1, 2,  'LR-2',  'Follows 5 different one-step instructions such as sit down or come here'),
('Listener Responding', 1, 3,  'LR-3',  'Selects the correct item from an array of 3 when named by the instructor'),
('Listener Responding', 1, 4,  'LR-4',  'Follows 10 different one-step instructions across settings and people'),
('Listener Responding', 1, 5,  'LR-5',  'Responds to own name by orienting to the speaker within 5 seconds'),
('Listener Responding', 2, 6,  'LR-6',  'Follows 2-step instructions without gestural or physical prompts'),
('Listener Responding', 2, 7,  'LR-7',  'Selects 25 or more items from an array when verbally named'),
('Listener Responding', 2, 8,  'LR-8',  'Identifies body parts on self when named by another person'),
('Listener Responding', 2, 9,  'LR-9',  'Identifies people by name or relationship such as mom, teacher, or friend'),
('Listener Responding', 2, 10, 'LR-10', 'Follows instructions containing prepositions such as put it on the table'),
('Listener Responding', 3, 11, 'LR-11', 'Follows 3-step instructions presented verbally without visual supports'),
('Listener Responding', 3, 12, 'LR-12', 'Identifies items by function, feature, or class from verbal descriptions'),
('Listener Responding', 3, 13, 'LR-13', 'Selects 100 or more items from an array when verbally named'),
('Listener Responding', 3, 14, 'LR-14', 'Follows conditional instructions such as if it is red then pick it up'),
('Listener Responding', 3, 15, 'LR-15', 'Understands and responds correctly to complex sentences with embedded clauses'),

-- ============================================================
-- VP/MTS (Visual Perception / Matching to Sample)
-- ============================================================
('VP/MTS', 1, 1,  'VP-1',  'Matches identical 3D objects to a sample object without prompts'),
('VP/MTS', 1, 2,  'VP-2',  'Matches identical 2D pictures to a sample picture without prompts'),
('VP/MTS', 1, 3,  'VP-3',  'Matches 3D objects to corresponding 2D pictures across 5 different items'),
('VP/MTS', 1, 4,  'VP-4',  'Sorts items into 2 distinct categories without prompts'),
('VP/MTS', 1, 5,  'VP-5',  'Matches colors across 5 or more different color categories'),
('VP/MTS', 2, 6,  'VP-6',  'Completes 4-piece puzzles independently and without prompting'),
('VP/MTS', 2, 7,  'VP-7',  'Matches non-identical but functionally related objects or pictures'),
('VP/MTS', 2, 8,  'VP-8',  'Sorts items into 5 or more categories without prompts'),
('VP/MTS', 2, 9,  'VP-9',  'Matches printed letters and numbers to sample letters and numbers'),
('VP/MTS', 2, 10, 'VP-10', 'Identifies and matches repeating patterns in visual sequences'),
('VP/MTS', 3, 11, 'VP-11', 'Completes 10 or more piece puzzles independently across different puzzles'),
('VP/MTS', 3, 12, 'VP-12', 'Matches items with multiple simultaneous attributes such as color and shape'),
('VP/MTS', 3, 13, 'VP-13', 'Identifies missing elements in a visual array or incomplete pattern'),
('VP/MTS', 3, 14, 'VP-14', 'Completes visual sequences and predicts what comes next in a pattern'),
('VP/MTS', 3, 15, 'VP-15', 'Performs complex categorization tasks with overlapping or shared features'),

-- ============================================================
-- INDEPENDENT PLAY
-- ============================================================
('Independent Play', 1, 1,  'IP-1',  'Independently manipulates 2 or more toys appropriately for 30 or more seconds'),
('Independent Play', 1, 2,  'IP-2',  'Engages in appropriate play with 5 or more different toys without prompts'),
('Independent Play', 1, 3,  'IP-3',  'Completes a 3-step play sequence independently without adult prompting'),
('Independent Play', 1, 4,  'IP-4',  'Plays appropriately with toys for 3 or more minutes without interruption'),
('Independent Play', 1, 5,  'IP-5',  'Independently selects and engages with preferred toys during free time'),
('Independent Play', 2, 6,  'IP-6',  'Engages in constructive play such as building or assembling for 5 or more minutes'),
('Independent Play', 2, 7,  'IP-7',  'Independently follows the rules of a simple structured game'),
('Independent Play', 2, 8,  'IP-8',  'Creates novel and varied play scenarios with toys without adult direction'),
('Independent Play', 2, 9,  'IP-9',  'Transitions between play activities independently without prompting'),
('Independent Play', 2, 10, 'IP-10', 'Plays with 10 or more different toys in developmentally appropriate ways'),
('Independent Play', 3, 11, 'IP-11', 'Engages in complex pretend play scenarios for 10 or more minutes independently'),
('Independent Play', 3, 12, 'IP-12', 'Independently occupies self appropriately during transitions or waiting'),
('Independent Play', 3, 13, 'IP-13', 'Participates in age-appropriate leisure activities without adult support'),
('Independent Play', 3, 14, 'IP-14', 'Creates and follows self-imposed rules during independent play activities'),
('Independent Play', 3, 15, 'IP-15', 'Independently manages play activities in community settings without prompts'),

-- ============================================================
-- SOCIAL BEHAVIOR
-- ============================================================
('Social Behavior', 1, 1,  'SOC-1',  'Makes eye contact with peers during social interactions spontaneously'),
('Social Behavior', 1, 2,  'SOC-2',  'Responds to social initiations from familiar adults within 5 seconds'),
('Social Behavior', 1, 3,  'SOC-3',  'Initiates proximity to peers by moving near them in play areas'),
('Social Behavior', 1, 4,  'SOC-4',  'Shares materials with peers when prompted by an adult'),
('Social Behavior', 1, 5,  'SOC-5',  'Greets familiar adults and peers without prompting across settings'),
('Social Behavior', 2, 6,  'SOC-6',  'Initiates and sustains parallel play with a peer for 5 or more minutes'),
('Social Behavior', 2, 7,  'SOC-7',  'Takes turns with peers during structured activities without prompting'),
('Social Behavior', 2, 8,  'SOC-8',  'Spontaneously shares materials with peers without adult prompting'),
('Social Behavior', 2, 9,  'SOC-9',  'Offers help or assistance to peers during activities without prompting'),
('Social Behavior', 2, 10, 'SOC-10', 'Participates in group activities with 2 or more peers for 10 minutes'),
('Social Behavior', 3, 11, 'SOC-11', 'Initiates and maintains conversations with peers on preferred topics'),
('Social Behavior', 3, 12, 'SOC-12', 'Resolves peer conflicts using appropriate verbal strategies independently'),
('Social Behavior', 3, 13, 'SOC-13', 'Demonstrates cooperative play in group games with established rules'),
('Social Behavior', 3, 14, 'SOC-14', 'Shows empathy and perspective-taking toward peers in social situations'),
('Social Behavior', 3, 15, 'SOC-15', 'Develops and maintains reciprocal friendships with same-age peers'),

-- ============================================================
-- MOTOR IMITATION
-- ============================================================
('Motor Imitation', 1, 1,  'MI-1',  'Imitates 2 different gross motor actions immediately after adult model'),
('Motor Imitation', 1, 2,  'MI-2',  'Imitates 5 different gross motor actions with immediate modeling'),
('Motor Imitation', 1, 3,  'MI-3',  'Imitates 2 or more actions performed with objects after a model'),
('Motor Imitation', 1, 4,  'MI-4',  'Imitates 10 different gross and fine motor actions across sessions'),
('Motor Imitation', 1, 5,  'MI-5',  'Imitates sequences of 2 motor actions immediately after adult demonstration'),
('Motor Imitation', 2, 6,  'MI-6',  'Imitates fine motor actions such as clapping patterns and finger plays'),
('Motor Imitation', 2, 7,  'MI-7',  'Imitates 3-step action sequences immediately after a single demonstration'),
('Motor Imitation', 2, 8,  'MI-8',  'Imitates actions performed with novel or unfamiliar objects'),
('Motor Imitation', 2, 9,  'MI-9',  'Imitates 20 or more different motor actions accurately across people'),
('Motor Imitation', 2, 10, 'MI-10', 'Imitates oral motor movements including mouth and tongue positions'),
('Motor Imitation', 3, 11, 'MI-11', 'Imitates complex sequential behaviors such as simple dance routines'),
('Motor Imitation', 3, 12, 'MI-12', 'Demonstrates deferred imitation of peer behaviors after a delay'),
('Motor Imitation', 3, 13, 'MI-13', 'Spontaneously imitates peer play actions without adult instruction'),
('Motor Imitation', 3, 14, 'MI-14', 'Imitates subtle social behaviors such as facial expressions and gestures'),
('Motor Imitation', 3, 15, 'MI-15', 'Spontaneously imitates peer behavior across multiple settings and people'),

-- ============================================================
-- ECHOIC
-- ============================================================
('Echoic', 1, 1,  'ECH-1',  'Vocalizes any sound in response to verbal stimuli within 5 seconds'),
('Echoic', 1, 2,  'ECH-2',  'Echoes 5 different CV or CVC syllables such as ba, ma, or cup'),
('Echoic', 1, 3,  'ECH-3',  'Echoes 2-syllable words with intelligible and recognizable sounds'),
('Echoic', 1, 4,  'ECH-4',  'Echoes 10 different single words with 50 percent or greater accuracy'),
('Echoic', 1, 5,  'ECH-5',  'Echoes simple 2-word phrases immediately after they are modeled'),
('Echoic', 2, 6,  'ECH-6',  'Echoes 3-word phrases with 80 percent or greater intelligibility'),
('Echoic', 2, 7,  'ECH-7',  'Echoes novel words accurately on the first trial without prior exposure'),
('Echoic', 2, 8,  'ECH-8',  'Echoes sentences of 4 or more words with accurate content and order'),
('Echoic', 2, 9,  'ECH-9',  'Echoes minimal pair words accurately such as bat versus pat'),
('Echoic', 2, 10, 'ECH-10', 'Echoes complex sentences with embedded clauses across multiple examples'),
('Echoic', 3, 11, 'ECH-11', 'Echoes and produces all phonemes correctly within words across contexts'),
('Echoic', 3, 12, 'ECH-12', 'Echoes multisyllabic words and tongue twisters with accurate articulation'),
('Echoic', 3, 13, 'ECH-13', 'Echoes sentences while maintaining appropriate prosody and intonation'),
('Echoic', 3, 14, 'ECH-14', 'Echoes and repeats novel sentences with correct grammatical structure'),
('Echoic', 3, 15, 'ECH-15', 'Echoes paragraphs of 3 or more sentences with accurate content recall'),

-- ============================================================
-- LRFFC (Listener Responding by Function, Feature, and Class)
-- ============================================================
('LRFFC', 1, 1,  'LFF-1',  'Selects an item from an array when given a function cue such as something you eat'),
('LRFFC', 1, 2,  'LFF-2',  'Identifies 5 different items by function from a field of 3 items'),
('LRFFC', 1, 3,  'LFF-3',  'Selects items by a feature cue such as find the red one or the round one'),
('LRFFC', 1, 4,  'LFF-4',  'Selects items by class such as find a fruit or find an animal'),
('LRFFC', 1, 5,  'LFF-5',  'Identifies 10 items by function, feature, or class from an array of 3'),
('LRFFC', 2, 6,  'LFF-6',  'Identifies 25 items by function, feature, or class from a field of 5 or more'),
('LRFFC', 2, 7,  'LFF-7',  'Responds to 2-component LRFFC cues such as find the big red ball'),
('LRFFC', 2, 8,  'LFF-8',  'Identifies category members from verbal descriptions across 10 categories'),
('LRFFC', 2, 9,  'LFF-9',  'Selects items from verbal descriptions without visual cues or pictures'),
('LRFFC', 2, 10, 'LFF-10', 'Responds to LRFFC cues embedded in stories and conversational contexts'),
('LRFFC', 3, 11, 'LFF-11', 'Identifies 100 or more items by function, feature, or class from arrays'),
('LRFFC', 3, 12, 'LFF-12', 'Responds to complex LRFFC cues with 3 or more component descriptors'),
('LRFFC', 3, 13, 'LFF-13', 'Identifies relationships between items based on verbal descriptions alone'),
('LRFFC', 3, 14, 'LFF-14', 'Completes LRFFC tasks in community and naturalistic settings without prompts'),
('LRFFC', 3, 15, 'LFF-15', 'Uses LRFFC skills to follow complex directions in academic and social settings'),

-- ============================================================
-- INTRAVERBAL
-- ============================================================
('Intraverbal', 1, 1,  'IV-1',  'Completes 2 different fill-in-the-blank phrases such as ready set blank'),
('Intraverbal', 1, 2,  'IV-2',  'Answers simple questions about self including name and age'),
('Intraverbal', 1, 3,  'IV-3',  'Completes 5 different fill-in-the-blank phrases from familiar routines'),
('Intraverbal', 1, 4,  'IV-4',  'Answers yes or no questions about own preferences or feelings'),
('Intraverbal', 1, 5,  'IV-5',  'Responds to greetings with appropriate intraverbal replies'),
('Intraverbal', 2, 6,  'IV-6',  'Answers 10 different wh-questions about familiar and known topics'),
('Intraverbal', 2, 7,  'IV-7',  'Completes 20 fill-in-the-blank phrases from songs and familiar routines'),
('Intraverbal', 2, 8,  'IV-8',  'Names 3 or more items in a category when asked such as name some animals'),
('Intraverbal', 2, 9,  'IV-9',  'Answers questions about stories and events that have been read aloud'),
('Intraverbal', 2, 10, 'IV-10', 'Maintains a topic during 3-exchange conversations with familiar partners'),
('Intraverbal', 3, 11, 'IV-11', 'Answers questions about past and future events with accurate detail'),
('Intraverbal', 3, 12, 'IV-12', 'Engages in reciprocal conversations on varied topics for 5 or more exchanges'),
('Intraverbal', 3, 13, 'IV-13', 'Defines words and explains concepts verbally without visual supports'),
('Intraverbal', 3, 14, 'IV-14', 'Retells stories and events with sequenced and accurate details'),
('Intraverbal', 3, 15, 'IV-15', 'Debates, discusses, and explains personal perspectives on varied topics'),

-- ============================================================
-- CLASSROOM ROUTINES
-- ============================================================
('Classroom Routines', 1, 1,  'CR-1',  'Sits in a group setting for 1 or more minutes without adult prompts'),
('Classroom Routines', 1, 2,  'CR-2',  'Transitions between 2 activities with a single verbal prompt from staff'),
('Classroom Routines', 1, 3,  'CR-3',  'Follows a 2-step classroom routine such as hang backpack then sit down'),
('Classroom Routines', 1, 4,  'CR-4',  'Stays on task for 5 minutes during structured activities with adult nearby'),
('Classroom Routines', 1, 5,  'CR-5',  'Responds to group instructions with the same compliance as individual ones'),
('Classroom Routines', 2, 6,  'CR-6',  'Independently follows a 5-step morning arrival routine without prompts'),
('Classroom Routines', 2, 7,  'CR-7',  'Raises hand and waits to be called on before speaking in group settings'),
('Classroom Routines', 2, 8,  'CR-8',  'Transitions between activities independently when given a schedule cue'),
('Classroom Routines', 2, 9,  'CR-9',  'Manages personal materials and belongings independently throughout the day'),
('Classroom Routines', 2, 10, 'CR-10', 'Participates in group instruction for 15 or more minutes without prompting'),
('Classroom Routines', 3, 11, 'CR-11', 'Self-manages behavior using visual schedules or personal checklists'),
('Classroom Routines', 3, 12, 'CR-12', 'Completes multi-step academic tasks independently until finished'),
('Classroom Routines', 3, 13, 'CR-13', 'Seeks help appropriately from adults when stuck on a task'),
('Classroom Routines', 3, 14, 'CR-14', 'Follows school-wide rules and routines consistently across all settings'),
('Classroom Routines', 3, 15, 'CR-15', 'Manages homework and take-home materials independently without reminders'),

-- ============================================================
-- LINGUISTIC STRUCTURE
-- ============================================================
('Linguistic Structure', 1, 1,  'LS-1',  'Uses 2-word noun-verb combinations such as doggy run or daddy eat'),
('Linguistic Structure', 1, 2,  'LS-2',  'Uses pronouns I and you appropriately in spontaneous speech'),
('Linguistic Structure', 1, 3,  'LS-3',  'Uses regular plural forms of nouns such as cats, dogs, and books'),
('Linguistic Structure', 1, 4,  'LS-4',  'Uses present progressive verb tense such as running or jumping'),
('Linguistic Structure', 1, 5,  'LS-5',  'Uses adjectives before nouns in spontaneous speech such as big ball'),
('Linguistic Structure', 2, 6,  'LS-6',  'Uses regular past tense verbs correctly such as walked and jumped'),
('Linguistic Structure', 2, 7,  'LS-7',  'Uses possessive forms and pronouns correctly in spontaneous speech'),
('Linguistic Structure', 2, 8,  'LS-8',  'Uses prepositions accurately in spontaneous speech across contexts'),
('Linguistic Structure', 2, 9,  'LS-9',  'Uses articles a and the correctly in spontaneous utterances'),
('Linguistic Structure', 2, 10, 'LS-10', 'Uses conjunctions to combine clauses such as and, but, and because'),
('Linguistic Structure', 3, 11, 'LS-11', 'Uses irregular past tense verbs correctly such as ran, ate, and went'),
('Linguistic Structure', 3, 12, 'LS-12', 'Uses complex sentence structures with embedded and dependent clauses'),
('Linguistic Structure', 3, 13, 'LS-13', 'Uses future tense constructions appropriately in spontaneous speech'),
('Linguistic Structure', 3, 14, 'LS-14', 'Uses conditional sentences such as if-then constructions correctly'),
('Linguistic Structure', 3, 15, 'LS-15', 'Demonstrates full grammatical competence in spontaneous conversational speech'),

-- ============================================================
-- READING
-- ============================================================
('Reading', 1, 1,  'RDG-1',  'Matches a printed word card to the corresponding picture or object'),
('Reading', 1, 2,  'RDG-2',  'Identifies own first name in print across multiple formats and fonts'),
('Reading', 1, 3,  'RDG-3',  'Reads 5 functional sight words such as stop, exit, and go'),
('Reading', 1, 4,  'RDG-4',  'Identifies all 26 letters of the alphabet in uppercase and lowercase'),
('Reading', 1, 5,  'RDG-5',  'Reads 10 functional and environmental sight words across settings'),
('Reading', 2, 6,  'RDG-6',  'Reads 20 sight words from a common high-frequency word list'),
('Reading', 2, 7,  'RDG-7',  'Decodes simple 3-letter CVC words using phonics knowledge'),
('Reading', 2, 8,  'RDG-8',  'Reads simple 2 to 3 word phrases with correct word identification'),
('Reading', 2, 9,  'RDG-9',  'Reads simple sentences of 4 to 5 words with full comprehension'),
('Reading', 2, 10, 'RDG-10', 'Reads short paragraphs and answers comprehension questions about content'),
('Reading', 3, 11, 'RDG-11', 'Reads grade-level passages with 80 percent or greater comprehension'),
('Reading', 3, 12, 'RDG-12', 'Answers inferential and higher-order questions about reading material'),
('Reading', 3, 13, 'RDG-13', 'Reads aloud with appropriate fluency, rate, and prosody'),
('Reading', 3, 14, 'RDG-14', 'Reads independently for pleasure or information across varied genres'),
('Reading', 3, 15, 'RDG-15', 'Demonstrates critical reading and text analysis skills across genres'),

-- ============================================================
-- WRITING
-- ============================================================
('Writing', 1, 1,  'WRT-1',  'Imitates vertical and horizontal pencil strokes after a model'),
('Writing', 1, 2,  'WRT-2',  'Copies simple shapes including circle, square, and triangle'),
('Writing', 1, 3,  'WRT-3',  'Writes own first name legibly without a model to copy'),
('Writing', 1, 4,  'WRT-4',  'Copies individual letters accurately from a printed model'),
('Writing', 1, 5,  'WRT-5',  'Writes all letters of the alphabet legibly from dictation'),
('Writing', 2, 6,  'WRT-6',  'Writes numbers 1 through 10 legibly and independently'),
('Writing', 2, 7,  'WRT-7',  'Copies full sentences from a printed model with accurate spacing'),
('Writing', 2, 8,  'WRT-8',  'Writes simple words from dictation without a visual model'),
('Writing', 2, 9,  'WRT-9',  'Writes simple sentences independently in response to a verbal prompt'),
('Writing', 2, 10, 'WRT-10', 'Uses correct spacing, capitalization, and ending punctuation in sentences'),
('Writing', 3, 11, 'WRT-11', 'Writes multi-sentence paragraphs on a given topic independently'),
('Writing', 3, 12, 'WRT-12', 'Organizes written work with a clear beginning, middle, and end'),
('Writing', 3, 13, 'WRT-13', 'Edits own writing to identify and correct mechanical errors'),
('Writing', 3, 14, 'WRT-14', 'Writes in different genres including narrative, informational, and opinion'),
('Writing', 3, 15, 'WRT-15', 'Produces extended written work with coherent and organized structure'),

-- ============================================================
-- MATH
-- ============================================================
('Math', 1, 1,  'MTH-1',  'Counts 3 objects with accurate one-to-one correspondence'),
('Math', 1, 2,  'MTH-2',  'Identifies and names numerals 1 through 5 when shown'),
('Math', 1, 3,  'MTH-3',  'Counts 10 objects with accurate one-to-one correspondence'),
('Math', 1, 4,  'MTH-4',  'Identifies and names numerals 1 through 10 when shown'),
('Math', 1, 5,  'MTH-5',  'Matches quantities 1 through 5 to the corresponding written numeral'),
('Math', 2, 6,  'MTH-6',  'Performs addition with sums to 10 using manipulatives or fingers'),
('Math', 2, 7,  'MTH-7',  'Performs subtraction within 10 using manipulatives or fingers'),
('Math', 2, 8,  'MTH-8',  'Identifies common coins and states their monetary values'),
('Math', 2, 9,  'MTH-9',  'Solves simple word problems using addition or subtraction within 10'),
('Math', 2, 10, 'MTH-10', 'Identifies and continues simple repeating number patterns'),
('Math', 3, 11, 'MTH-11', 'Performs multi-digit addition and subtraction with regrouping'),
('Math', 3, 12, 'MTH-12', 'Multiplies and divides within 100 with accuracy'),
('Math', 3, 13, 'MTH-13', 'Uses a calculator for functional and real-life math tasks'),
('Math', 3, 14, 'MTH-14', 'Makes correct change using coins and bills in functional transactions'),
('Math', 3, 15, 'MTH-15', 'Applies math skills to solve real-life functional problems independently'),

-- ============================================================
-- SPELLING
-- ============================================================
('Spelling', 1, 1,  'SPL-1',  'Identifies and names letters by sound when letters are shown'),
('Spelling', 1, 2,  'SPL-2',  'Spells own first name correctly from dictation without a model'),
('Spelling', 1, 3,  'SPL-3',  'Spells 5 simple 3-letter CVC words from dictation without a model'),
('Spelling', 1, 4,  'SPL-4',  'Arranges letter tiles to spell simple CVC words from a verbal cue'),
('Spelling', 1, 5,  'SPL-5',  'Spells 10 high-frequency sight words correctly from dictation'),
('Spelling', 2, 6,  'SPL-6',  'Spells 25 words from a grade-level high-frequency word list'),
('Spelling', 2, 7,  'SPL-7',  'Applies basic spelling rules such as consonant doubling and silent e'),
('Spelling', 2, 8,  'SPL-8',  'Spells words containing common digraphs such as sh, ch, th, and wh'),
('Spelling', 2, 9,  'SPL-9',  'Identifies and self-corrects spelling errors in own written work'),
('Spelling', 2, 10, 'SPL-10', 'Spells words with common prefixes and suffixes correctly'),
('Spelling', 3, 11, 'SPL-11', 'Spells 100 or more words correctly from dictation across sessions'),
('Spelling', 3, 12, 'SPL-12', 'Applies advanced spelling rules accurately to novel and unfamiliar words'),
('Spelling', 3, 13, 'SPL-13', 'Uses a dictionary to locate and verify correct spelling independently'),
('Spelling', 3, 14, 'SPL-14', 'Demonstrates phonemic awareness when spelling multisyllabic words'),
('Spelling', 3, 15, 'SPL-15', 'Spells accurately in spontaneous written communication across settings');
