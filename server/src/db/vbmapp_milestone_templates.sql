-- VB-MAPP Milestone-Specific Program Plan Templates
-- These rows override the broader domain template when a selected milestone
-- needs more specific teaching guidance (for example, LR-11 vs LR-12 vs LR-13).

CREATE TABLE IF NOT EXISTS vbmapp_milestone_templates (
  id                         SERIAL PRIMARY KEY,
  milestone_code             VARCHAR(20) UNIQUE NOT NULL REFERENCES vbmapp_milestones(milestone_code) ON DELETE CASCADE,
  vbmapp_domain              VARCHAR(100) NOT NULL,
  data_collection            TEXT,
  prerequisite_skills        TEXT,
  materials                  TEXT,
  sd                         TEXT,
  correct_responses          TEXT,
  incorrect_responses        TEXT,
  prompting_hierarchy        VARCHAR(20) DEFAULT 'most_to_least'
    CHECK (prompting_hierarchy IN ('most_to_least', 'least_to_most')),
  prompting_hierarchy_detail TEXT,
  error_correction           TEXT,
  transfer_procedure         TEXT,
  reinforcement_schedule     TEXT,
  generalization_plan        TEXT,
  maintenance_plan           TEXT
);

-- Seed targeted listener-responding milestone overrides.
-- These are intentionally limited and can be expanded or replaced with
-- PDF-aligned content later.
INSERT INTO vbmapp_milestone_templates
  (milestone_code, vbmapp_domain, data_collection, prerequisite_skills, materials, sd,
   correct_responses, incorrect_responses, prompting_hierarchy, prompting_hierarchy_detail,
   error_correction, transfer_procedure, reinforcement_schedule, generalization_plan, maintenance_plan)
VALUES
('LR-11', 'Listener Responding',
 'Collect trial-by-trial data separately for color targets and shape targets. Use arrays of 6 similar stimuli and record independent, prompted, incorrect, and position-biased responses for each of the 4 colors and 4 shapes being taught. Probe with mixed arrays after mastery in blocked teaching.',
 'Learner already selects named items from arrays, tolerates similar distractors, and has emerging discrimination of simple visual features. Baseline listener responding should be established before combining the noun with color or shape terms.',
 'Arrays of similar stimuli that vary by color or shape, such as cars in multiple colors, crackers in different shapes, geometric manipulatives, colored blocks, picture cards, and mixed item sets that allow the child to respond to the relevant feature rather than the item class alone.',
 '"Find the red car," "Touch the blue one," "Give me the square cracker," or "Show me the circle." Present one spoken direction at a time from an array of 6 similar stimuli and rotate target position every trial.',
 'Learner selects the item with the correct color or shape within 5 seconds, without scanning through the array or relying on therapist cueing. The response must show control by the spoken feature term, not just by the item name.',
 'Learner selects an item with the correct noun but wrong color or shape, selects based on position, scrolls through items before choosing, does not respond within 5 seconds, or needs an extra cue or prompt beyond the initial SD.',
 'most_to_least',
 'Begin with the least confusing contrast and only the minimum prompt needed after the SD: full physical if necessary, then partial physical, gestural cue to the relevant item, brief model of the correct response, then independent responding. Fade prompts quickly so color and shape words become the controlling variables.',
 'Interrupt the error, remove or reset the array, model the correct feature contrast, guide the learner to the correct item, and immediately re-probe with a new array arrangement. Insert one or two easy listener trials before returning to the feature target.',
 'Teach one feature dimension at a time with exaggerated contrasts first, then mix color and shape trials within the same session. Progress from blocked sets to mixed arrays, then to novel examples of the same colors and shapes across multiple item classes.',
 'Use dense reinforcement for independent correct feature discriminations during acquisition. Reinforce prompted trials more lightly and fade toward natural praise, access to play materials, and embedded reinforcement in tabletop and play routines.',
 'Generalize across multiple item classes, adults, rooms, and display formats. Probe colors and shapes in books, puzzles, classroom materials, snack items, dress-up materials, and naturally occurring items so the child responds to the spoken feature across contexts.',
 'Include mixed maintenance probes for color and shape discriminations each week. Revisit mastered features in larger arrays and in natural routines to ensure the learner continues to respond accurately when stimuli are less structured.'),

('LR-12', 'Listener Responding',
 'Collect trial-by-trial data across preposition targets and pronoun targets separately, then in mixed sessions. Record whether the learner followed the full spoken direction independently, needed prompting, responded to only part of the direction, or confused the pronoun or spatial term.',
 'Learner follows simple one-step listener directions, has a stable body-part and object repertoire, and can respond to actions involving people and materials. Earlier listener skills should be established before teaching relational terms such as behind, under, or pronoun shifts such as my versus your.',
 'Chairs, tables, boxes, cups, toys, body-part targets, picture scenes, movement spaces, and materials that allow the learner to move self or objects in relation to other objects. Include at least 6 prepositions and 4 pronoun forms used consistently across teaching trials.',
 '"Stand behind the chair," "Put the block under the cup," "Touch my ear," "Touch your nose," or "Give her the ball." Deliver the instruction once and arrange materials so the learner must respond to the relational or pronoun word, not guess from context.',
 'Learner completes the action exactly as stated, including the correct preposition or pronoun reference, within 5 seconds and without additional gestural or visual prompts. Correct responding shows discrimination of the relational word in the spoken instruction.',
 'Learner performs the right action with the wrong location, touches the wrong person or body part, follows only part of the direction, guesses from therapist movement, needs repeated instructions, or does not respond within 5 seconds.',
 'most_to_least',
 'Use only the prompt needed after the spoken SD: full physical guidance if necessary, then partial physical, gestural cue, modeled action, and finally independent responding. Fade quickly so the learner responds to the verbal relation or pronoun rather than to therapist movement.',
 'Reset the materials, immediately guide the full correct response, label the critical word in the instruction, and re-present the same direction with reduced prompting. Follow with an easy mastered listener direction, then return to the target in a new arrangement.',
 'Begin with a small set of highly contrasted prepositions and pronouns in structured formats. Move to mixed-object actions, mixed-body-part directions, and then mixed preposition-pronoun sessions. Progress from tabletop arrangements to full-room movement directions and everyday routines.',
 'Provide dense reinforcement for independent correct responses during acquisition, especially when the learner responds to the full relational word without extra cues. Thin prompted-trial reinforcement and fade to social praise and participation in the ongoing activity.',
 'Generalize across rooms, adults, classroom routines, playground directions, movement games, dressing routines, and picture-scene tasks. Vary who is referenced by the pronoun and which objects or furniture are used for preposition targets.',
 'Probe prepositions and pronouns during daily routines each week, such as cleanup, obstacle courses, group directions, and body-part games. Revisit mixed trials regularly so the learner does not maintain the targets only in one teaching format.'),

('LR-13', 'Listener Responding',
 'Collect trial-by-trial data separately for relative adjective selections and relative adverb action demonstrations, then combine them in mixed probe sessions. Record independent, prompted, incorrect, and partial responses for each adjective pair and adverb pair across multiple examples.',
 'Learner already responds to familiar array discriminations and action directions, and can attend to contrasting dimensions when they are made salient. Foundational listener skills should be established before teaching relative terms such as big-little, long-short, fast-slow, and quiet-loud.',
 'Pairs or arrays of similar items that differ in size, length, or other relative dimensions, plus action routines for adverb targets such as clapping, walking, talking, or moving objects. Include multiple examples for each adjective and adverb pair so the response is controlled by the relation, not one memorized item.',
 '"Find the big spoon," "Show me the little ball," "Pick the long one," "Walk slowly," "Clap loudly," or "Move the car quietly." Present one contrast at a time initially, then mix adjective and adverb directions in later teaching.',
 'Learner selects the item with the correct relative feature or performs the action according to the named adverb within 5 seconds, without needing extra models or prompts. The response must show discrimination of the relative term, not a memorized motor routine.',
 'Learner selects the opposite item, performs the action without the targeted quality, responds randomly, imitates therapist movement instead of following the spoken word, or requires additional prompting beyond the initial direction.',
 'most_to_least',
 'Start with clear exaggerated contrasts and only the minimum prompt needed after the SD: full physical or modeled action if needed, then partial physical, gestural cue, brief model, and finally independent responding. Fade prompts rapidly so the spoken relative term controls the response.',
 'Stop the error, re-establish the contrast with the two extremes, model or guide the correct selection or action, and then re-present the target with less support. Insert a mastered listener trial before mixing the target back into instruction.',
 'Teach one contrast pair at a time with obvious examples, then expand to new exemplars of the same pair. After adjective and adverb targets are stable separately, mix them together and embed them in play, movement, and tabletop routines.',
 'Use immediate reinforcement for independent correct responses during acquisition. Reinforce prompted responses more lightly and transition toward social praise, access to movement games, and natural consequences built into the activity.',
 'Generalize across item types, action types, adults, rooms, play routines, classroom directions, books, and movement games. Use new examples of each adjective pair and adverb pair so the learner responds to the relation itself rather than a familiar material set.',
 'Probe adjective and adverb pairs weekly in mixed sessions and natural routines. Revisit mastered relative terms with new materials and actions over time so the skill remains flexible and does not become tied to one example.')
ON CONFLICT (milestone_code) DO UPDATE
SET vbmapp_domain = EXCLUDED.vbmapp_domain,
    data_collection = EXCLUDED.data_collection,
    prerequisite_skills = EXCLUDED.prerequisite_skills,
    materials = EXCLUDED.materials,
    sd = EXCLUDED.sd,
    correct_responses = EXCLUDED.correct_responses,
    incorrect_responses = EXCLUDED.incorrect_responses,
    prompting_hierarchy = EXCLUDED.prompting_hierarchy,
    prompting_hierarchy_detail = EXCLUDED.prompting_hierarchy_detail,
    error_correction = EXCLUDED.error_correction,
    transfer_procedure = EXCLUDED.transfer_procedure,
    reinforcement_schedule = EXCLUDED.reinforcement_schedule,
    generalization_plan = EXCLUDED.generalization_plan,
    maintenance_plan = EXCLUDED.maintenance_plan;
