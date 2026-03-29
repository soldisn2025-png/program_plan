const DOMAIN_PROFILES = {
  'Mand': {
    prompting_hierarchy: 'least_to_most',
    measurement_focus: 'the target mand repertoire',
    prerequisite_lead:
      'Learner shows relevant motivating operations, tolerates brief teaching, and can emit or approximate a functional request response.',
    materials_lead:
      'Prepare highly preferred items, activities, missing-item set-ups, and any needed communication supports tied to the target request.',
    sd_lead:
      'Arrange the motivating operation and present the natural opportunity or brief cue needed for the target request.',
    incorrect_lead:
      'Incorrect responding includes no request, an unrelated request, prompt-dependent responding, or behavior that replaces the functional mand.',
    prompting_detail:
      'Start with an independent opportunity and use only the least intrusive support needed, such as time delay, gestural support, partial verbal cue, full verbal model, or AAC/sign support. Fade prompts quickly so the motivating operation controls the mand.',
    error_correction:
      'If the learner does not emit the correct mand, briefly re-create the need, prompt the target request with the least support necessary, and re-probe quickly so the mand contacts reinforcement under more independent conditions.',
    transfer_lead:
      'Transfer from prompted to spontaneous manding by preserving the motivating operation and fading verbal, visual, and positional prompts as rapidly as success allows.',
    reinforcement_lead:
      'Independent correct manding should contact the requested item, activity, information, or escape outcome immediately. Prompted responses should receive lighter reinforcement than independent responses.',
    generalization_lead:
      'Teach across adults, settings, materials, and multiple examples of the requested item or activity so the mand does not stay tied to one teaching arrangement.',
    maintenance_lead:
      'Embed mastered mand targets throughout daily routines and continue expanding the request repertoire as new motivating operations emerge.',
  },
  'Tact': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target tact or labeling response',
    prerequisite_lead:
      'Learner attends to presented stimuli, tolerates brief teaching, and has enough vocal, imitative, signing, or AAC ability to label what is seen or experienced.',
    materials_lead:
      'Prepare objects, pictures, actions, people, and other stimuli that match the tact target, along with varied exemplars for generalization.',
    sd_lead:
      'Present the target stimulus and use the natural tact cue or pause appropriate for the milestone.',
    incorrect_lead:
      'Incorrect responding includes no label, the wrong label, echolalic repetition of the SD, or responding that depends on prompts beyond the teaching plan.',
    prompting_detail:
      'Use the least prompt that still keeps the response accurate, such as time delay, partial echoic, full echoic, model, or AAC/sign support. Fade prompts so the nonverbal stimulus controls the tact.',
    error_correction:
      'After an error, briefly model the correct label, have the learner contact the right response form, and then re-present the target with reduced support so stimulus control shifts back to the item, action, or feature being tacted.',
    transfer_lead:
      'Move from prompted labeling to independent tacting by rotating stimuli, fading echoic support, and mixing mastered and new targets in natural contexts.',
    reinforcement_lead:
      'Provide strong reinforcement for independent correct tacts and lighter reinforcement for prompted responses, fading toward naturally occurring social consequences as tacting becomes more fluent.',
    generalization_lead:
      'Teach across adults, materials, pictures, objects, actions, and settings so the tact generalizes beyond one exemplar or one teaching format.',
    maintenance_lead:
      'Probe mastered tacts regularly in play, books, routines, and conversation so the repertoire remains broad and ready to support mand, listener, and intraverbal growth.',
  },
  'Listener Responding': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target listener discrimination or direction-following skill',
    prerequisite_lead:
      'Learner attends to spoken language, orients to the instructor, and can tolerate brief receptive-language teaching with clear visual arrays or action opportunities.',
    materials_lead:
      'Prepare pictures, objects, body-part targets, action materials, books, scene pictures, and natural-environment arrays that match the listener target.',
    sd_lead:
      'Deliver the spoken direction or question once in a clear natural voice and allow the learner time to respond without extra cueing unless the plan specifically calls for a prompt.',
    incorrect_lead:
      'Incorrect responding includes selecting the wrong item, performing the wrong action, scrolling, position responding, no response, or reliance on prompts that prevent the spoken words from being the controlling variable.',
    prompting_detail:
      'Start with the least intrusive prompt needed after the spoken SD, such as gestural, model, partial physical, or full physical support. Fade prompts quickly so the spoken words, not the therapist movement, control the response.',
    error_correction:
      'Re-present the spoken SD, block errors from contacting reinforcement, guide the correct response, and then re-probe with reduced support. Use easy listener trials between corrections when needed to keep responding accurate and fluent.',
    transfer_lead:
      'Move from prompted responding to independent listener behavior by gradually expanding arrays, reducing visual support, and rotating between structured trials and natural opportunities.',
    reinforcement_lead:
      'Use dense reinforcement for independent correct listener responding during acquisition and lighter reinforcement for prompted responses, fading toward praise and naturally occurring consequences in routines and play.',
    generalization_lead:
      'Teach across adults, rooms, books, pictures, objects, and natural routines so the learner responds to spoken language in both structured and everyday contexts.',
    maintenance_lead:
      'Probe mastered listener skills during normal routines, books, play, and classroom directions so the repertoire stays strong and keeps pace with tact, mand, and social-language development.',
  },
  'VP/MTS': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target visual-perceptual or matching-to-sample task',
    prerequisite_lead:
      'Learner visually attends to materials, tolerates brief tabletop work, and can reach, place, point to, or manipulate items well enough to complete the task.',
    materials_lead:
      'Prepare matching sets, puzzles, blocks, cards, arrays, and related visual materials that directly reflect the target discrimination or construction task.',
    sd_lead:
      'Present the sample, comparison array, or construction task and give the natural instruction for matching, sorting, sequencing, or completing the visual task.',
    incorrect_lead:
      'Incorrect responding includes choosing a nonmatching item, placing materials incorrectly, no response, or relying on prompts that prevent the visual stimulus from controlling the response.',
    prompting_detail:
      'Use only the support needed, such as positional cues, gestural prompts, model prompts, partial physical guidance, or full physical guidance. Fade prompts so the visual features of the task become the controlling variables.',
    error_correction:
      'Reset the task, model or guide the correct response, and then re-present the same or a closely related visual task with less support so the learner practices accurate discrimination.',
    transfer_lead:
      'Move from simple, highly supported visual tasks to larger arrays, non-identical matches, sequences, patterns, and natural-environment visual discriminations with progressively less prompting.',
    reinforcement_lead:
      'Provide immediate reinforcement for independent correct responses during acquisition and lighter reinforcement for prompted trials, fading toward the natural reinforcement built into successful puzzle, matching, and construction tasks.',
    generalization_lead:
      'Program across materials, item classes, array sizes, books, scenes, and natural settings so the learner responds to the visual relation rather than to one memorized set.',
    maintenance_lead:
      'Revisit mastered matching and visual-perceptual targets regularly while expanding toward more abstract visual tasks, patterns, and problem-solving materials.',
  },
  'Independent Play': {
    prompting_hierarchy: 'least_to_most',
    measurement_focus: 'the target independent play or leisure behavior',
    prerequisite_lead:
      'Learner shows at least some interest in toys, movement, objects, or activities and can tolerate reduced adult interaction long enough for independent play to emerge.',
    materials_lead:
      'Prepare preferred toys, cause-and-effect materials, pretend-play props, construction toys, art supplies, playground items, and leisure activities matched to the play target.',
    sd_lead:
      'Arrange the play environment and use as little adult direction as possible so the activity itself can begin to maintain the target play behavior.',
    incorrect_lead:
      'Incorrect responding includes no functional play, very brief contact only, repetitive nonfunctional use of materials, immediate adult-attention seeking that replaces play, or stopping before the expected duration or outcome.',
    prompting_detail:
      'Begin with environment arrangement and wait time. If needed, use a gestural cue, brief verbal suggestion, short model, or light physical support to start the play action, then fade adult involvement quickly.',
    error_correction:
      'Use brief neutral redirection back to the materials, model the functional or pretend action once if necessary, and then step back so the learner can contact the play activity more independently.',
    transfer_lead:
      'Move from short, supported play actions to longer and more varied play sequences, then to creative, pretend, gross motor, arts-and-crafts, and leisure activities with minimal adult involvement.',
    reinforcement_lead:
      'Allow the activity itself to become the main reinforcer whenever possible, adding brief praise or access to especially interesting materials only as needed to keep the learner engaged.',
    generalization_lead:
      'Rotate toys, rooms, play themes, and leisure materials across home, clinic, school, outdoor, and community settings so play stays flexible and age-appropriate.',
    maintenance_lead:
      'Keep a broad play menu available, revisit mastered play types weekly, and add new activities over time so independent play remains functional and supports later social play.',
  },
  'Social Behavior': {
    prompting_hierarchy: 'least_to_most',
    measurement_focus: 'the target social behavior, social interaction, or social play response',
    prerequisite_lead:
      'Learner tolerates proximity to other people, attends to social partners, and has enough play, mand, listener, or imitation skills to participate in supported social routines.',
    materials_lead:
      'Prepare preferred social games, turn-taking materials, peer-play items, conversation topics, pretend-play props, and naturally motivating activities that create real social opportunities.',
    sd_lead:
      'Arrange natural social opportunities with adults or peers and use only the amount of prompting needed for the learner to notice, join, respond, or initiate appropriately.',
    incorrect_lead:
      'Incorrect responding includes not orienting to the social partner, failing to respond, engaging in unrelated behavior, needing excessive adult mediation, or using responses that do not match the social opportunity.',
    prompting_detail:
      'Wait briefly for spontaneous social behavior first, then use the least intrusive support needed, such as a brief verbal cue, model, gestural prompt, or physical guidance. Fade prompts so peers and social activities become the natural cues.',
    error_correction:
      'Keep corrections brief and supportive. Recreate the social opportunity, prompt the target response with the least support needed, reinforce success, and return quickly to natural interaction.',
    transfer_lead:
      'Move from adult-supported social opportunities to peer-based, cooperative, and conversational interactions by fading adult mediation and increasing the natural demands of play and interaction.',
    reinforcement_lead:
      'Use enthusiastic social reinforcement and access to preferred shared activities for independent correct social responding, thinning contrived reinforcement as social interaction itself becomes more rewarding.',
    generalization_lead:
      'Program across adults, peers, activities, rooms, community settings, and social routines so the learner can use the skill with different partners and in less scripted situations.',
    maintenance_lead:
      'Continue probing social behavior in natural play, classroom, and community settings and expand from isolated responses to more reciprocal and sustained social exchanges.',
  },
  'Motor Imitation': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target motor imitation response',
    prerequisite_lead:
      'Learner attends to modeled actions, can remain with the instructor briefly, and has enough motor control to approximate the target movement or object action.',
    materials_lead:
      'Prepare open space, body-part targets, gross motor materials, and object materials needed for the imitation target.',
    sd_lead:
      'Gain the learner attention, say "Do this" or use the natural imitation cue, and immediately model the target action without over-describing it.',
    incorrect_lead:
      'Incorrect responding includes a different action, only a partial response that misses the important movement, no response, or reliance on physical prompts beyond the planned hierarchy.',
    prompting_detail:
      'Use the least support that keeps the movement accurate, such as re-modeling, gestural cues, partial physical prompts, or full physical guidance, and then fade prompts so the model controls the imitation.',
    error_correction:
      'Re-model the target action, guide the learner through the correct movement if needed, reinforce the successful response, and then re-present the same action with less support.',
    transfer_lead:
      'Move from highly prompted imitation of simple actions to more independent imitation of body movements, object actions, and sequences that can later support classroom, play, and sign-language learning.',
    reinforcement_lead:
      'Use immediate reinforcement for independent correct imitation and lighter reinforcement for prompted trials, fading toward social praise and participation in ongoing games and activities.',
    generalization_lead:
      'Teach across adults, peers, movement types, materials, and settings so imitation does not stay limited to one instructor or one type of action.',
    maintenance_lead:
      'Probe mastered imitation responses regularly and keep adding new actions so imitation stays broad enough to support play, classroom routines, and language development.',
  },
  'Echoic': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target echoic, speech-sound, word, or phrase imitation response',
    prerequisite_lead:
      'Learner attends to the speaker voice, emits at least some vocal behavior, and tolerates brief vocal teaching interactions.',
    materials_lead:
      'Prepare highly reinforcing activities, preferred social interaction, and any articulation or EESA supports needed for the target sound, syllable, word, or phrase.',
    sd_lead:
      'Model the target sound, syllable, word, or phrase once in a clear natural voice and wait for the learner to repeat it.',
    incorrect_lead:
      'Incorrect responding includes no vocal response, an inaccurate sound pattern, a different vocalization, or responding only after extra models beyond the planned prompt level.',
    prompting_detail:
      'Start with the clearest model and any needed shaping support, then fade toward less intrusive vocal prompting so the learner can echo the target after one model.',
    error_correction:
      'Immediately re-model the target, accept the best available approximation that moves toward the correct form, reinforce success, and return to the target in short positive teaching blocks.',
    transfer_lead:
      'Use echoic strength to support tact, mand, and intraverbal teaching by fading models and transferring control from the spoken model to the relevant nonverbal or verbal stimulus.',
    reinforcement_lead:
      'Deliver immediate reinforcement for independent correct echoic responses and lighter reinforcement for prompted approximations, keeping vocal practice highly positive and frequent.',
    generalization_lead:
      'Program across adults, vocal volumes, rates, settings, and phonetic contexts so the learner does not depend on one voice or one teaching arrangement.',
    maintenance_lead:
      'Revisit mastered sounds and words regularly and keep linking echoic gains to new tact, mand, and intraverbal targets as vocabulary grows.',
  },
  'Spontaneous Vocal Behavior': {
    prompting_hierarchy: 'least_to_most',
    measurement_focus: 'the target spontaneous vocalization, babble pattern, or vocal play behavior',
    prerequisite_lead:
      'Learner orients to people or sensory-social activities, tolerates short interactive routines, and has at least some emerging vocal behavior or readiness for vocal play.',
    materials_lead:
      'Prepare motivating sensory-social routines, music, mirrors, movement activities, vocal toys, and preferred people or activities that reliably occasion spontaneous vocal behavior.',
    sd_lead:
      'Arrange rich vocal and sensory-social opportunities and watch for spontaneous sounds, babbling, or vocal play rather than relying on direct verbal instruction.',
    incorrect_lead:
      'Incorrect responding includes no vocal output, very low rates of vocal play, or vocal behavior that occurs only after repeated direct prompts when spontaneity is the target.',
    prompting_detail:
      'Keep prompts light and natural, such as pausing in a fun routine, imitating learner sounds, modeling playful vocalizations, or using movement and sensory cues that invite spontaneous vocal behavior.',
    error_correction:
      'If the learner is not vocalizing, briefly re-establish the motivating social or sensory routine, model a playful sound if needed, and return quickly to observing for spontaneous or less-prompted vocal behavior.',
    transfer_lead:
      'Move from adult-supported vocal play to more spontaneous vocal behavior by fading direct models and embedding vocal opportunities across naturally motivating routines.',
    reinforcement_lead:
      'Use dense social, sensory, and activity-based reinforcement for independent spontaneous vocalizations, keeping prompted vocal behavior less valuable than spontaneous output.',
    generalization_lead:
      'Program across people, activities, rooms, movement routines, songs, and daily interactions so spontaneous vocal behavior is not tied to one partner or one activity.',
    maintenance_lead:
      'Embed vocal-play opportunities throughout the day and keep expanding toward stronger echoic, mand, and tact development as spontaneous vocal behavior grows.',
  },
  'LRFFC': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target listener responding by function, feature, and class discrimination',
    prerequisite_lead:
      'Learner already responds to spoken directions, scans arrays or scenes, and has enough listener, tact, and category knowledge to discriminate among items by function, feature, or class.',
    materials_lead:
      'Prepare arrays, scene pictures, books, natural-environment materials, and item sets that allow the learner to respond to function, feature, and class cues without simply matching the item name.',
    sd_lead:
      'Present the LRFFC cue once and allow the learner to search the array, book, or natural environment for the correct item or items.',
    incorrect_lead:
      'Incorrect responding includes choosing the wrong item, responding only to one part of a multicomponent cue, guessing from position, no response, or requiring extra prompts that weaken the verbal discrimination.',
    prompting_detail:
      'Use the least support needed, such as gestural cues, model prompts, partial physical prompts, or brief verbal emphasis on the critical word, then fade quickly so the verbal cue controls the selection.',
    error_correction:
      'Reset the array or scene, highlight or guide the correct response, label the critical function, feature, or class cue, and then re-probe with less support so the learner practices the full verbal discrimination.',
    transfer_lead:
      'Move from simple arrays and single-feature cues to larger arrays, scenes, books, natural-environment targets, and more complex multicomponent verbal cues with less prompting.',
    reinforcement_lead:
      'Use immediate reinforcement for independent correct LRFFC responding and lighter reinforcement for prompted selections, fading toward natural praise and ongoing participation in the activity.',
    generalization_lead:
      'Program across adults, arrays, scenes, books, categories, and natural environments so LRFFC responding becomes flexible and supports later intraverbal development.',
    maintenance_lead:
      'Probe mastered LRFFC targets regularly while continuing to expand the range and complexity of function, feature, and class discriminations.',
  },
  'Intraverbal': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target intraverbal response',
    prerequisite_lead:
      'Learner has enough tact, listener, and echoic strength to answer or complete verbal stimuli without depending on visual cues.',
    materials_lead:
      'Prepare conversation topics, stories, songs, books, routines, and any brief visual supports used only temporarily during acquisition of the verbal relation.',
    sd_lead:
      'Deliver the verbal question, statement, fill-in, or conversation cue once without extra visual support unless the teaching plan specifically calls for it.',
    incorrect_lead:
      'Incorrect responding includes no answer, echolalic repetition of the SD, an unrelated answer, or responding only after extra prompts that prevent the verbal stimulus from controlling the response.',
    prompting_detail:
      'Start with the least support that keeps the intraverbal relation clear, such as time delay, partial verbal prompt, full verbal model, or temporary contextual support, and then fade toward independent responding after one verbal cue.',
    error_correction:
      'After an error, model the correct answer briefly, have the learner contact the right response form, and then re-probe with a similar or identical verbal cue after mixing in easier intraverbal trials.',
    transfer_lead:
      'Move from heavily prompted fill-ins and simple associations to more independent WH questions, multicomponent verbal stimuli, and flexible conversational responding across topics.',
    reinforcement_lead:
      'Use strong reinforcement for independent correct intraverbal responding during acquisition and lighter reinforcement for prompted responses, fading toward natural conversational and social consequences.',
    generalization_lead:
      'Program across adults, topics, books, stories, routines, and settings so the learner can respond intraverbally in both structured teaching and everyday conversation.',
    maintenance_lead:
      'Keep mastered intraverbal targets in daily conversation and continue adding new topics, questions, and response forms so the repertoire stays functional and flexible.',
  },
  'Classroom Routines': {
    prompting_hierarchy: 'least_to_most',
    measurement_focus: 'the target classroom, group, or routine-following behavior',
    prerequisite_lead:
      'Learner tolerates group or routine-based instruction, attends to adults and peers, and has enough listener and behavior-regulation skills to stay with classroom or small-group activities.',
    materials_lead:
      'Prepare the actual classroom, group, toileting, transition, work, or routine materials needed to practice the target behavior in context.',
    sd_lead:
      'Deliver the natural classroom, group, or routine cue once and allow the learner to respond within the activity rather than over-prompting with extra individualized direction.',
    incorrect_lead:
      'Incorrect responding includes not following the routine or group cue, off-task behavior, leaving the activity, responding only after individualized prompting, or completing the routine inaccurately.',
    prompting_detail:
      'Use the least intrusive prompt needed in the group or routine context, such as proximity, gestural cues, brief individual reminders, model prompts, or physical guidance, and fade support so the natural class cues control responding.',
    error_correction:
      'Keep corrections brief and context-appropriate. Re-present the cue if needed, guide the learner through the missed step, reinforce success, and return quickly to the routine or group activity.',
    transfer_lead:
      'Move from 1:1 teaching of routine steps to small-group and full-group participation by fading individualized supports and increasing independence within natural classroom demands.',
    reinforcement_lead:
      'Use behavior-specific praise, participation in ongoing classroom activities, and other naturally available reinforcers for independent routine-following, with lighter reinforcement for prompted successes.',
    generalization_lead:
      'Teach across instructors, rooms, school routines, group formats, and times of day so the learner can follow classroom expectations in a range of natural settings.',
    maintenance_lead:
      'Probe mastered routines within the regular school day and continue expanding from isolated classroom tasks to longer and more independent group participation.',
  },
  'Linguistic Structure': {
    prompting_hierarchy: 'least_to_most',
    measurement_focus: 'the target grammatical, phrase-level, or sentence-level language form',
    prerequisite_lead:
      'Learner has enough functional verbal behavior to produce multiword responses and can participate in brief structured or natural language-sampling activities.',
    materials_lead:
      'Prepare pictures, stories, play routines, conversation topics, and language-sampling contexts that make the target grammatical form or sentence structure relevant.',
    sd_lead:
      'Use natural conversation, picture description, story retell, or brief structured elicitations that create an opportunity for the target form to occur.',
    incorrect_lead:
      'Incorrect responding includes omitting the target form, using an earlier or incorrect grammatical form, producing a response that is too short to demonstrate the target structure, or not responding at all.',
    prompting_detail:
      'Keep prompting as natural as possible, using open-ended cues, recasts, fill-ins, models, or brief verbal prompts only as needed, and fade support so the learner can use the form in real communication.',
    error_correction:
      'Use brief recasts or models of the correct form, then create another natural opportunity for the learner to produce the target structure with less support.',
    transfer_lead:
      'Move from structured opportunities for a single grammatical form to more natural conversation and varied sentence frames so the learner uses the form flexibly across contexts.',
    reinforcement_lead:
      'Rely primarily on natural social reinforcement, expanding on successful language and using only enough extra reinforcement to keep the learner engaged and accurate.',
    generalization_lead:
      'Program across people, activities, picture descriptions, stories, play themes, and conversations so the learner can use the target structure outside drill-based teaching.',
    maintenance_lead:
      'Continue taking language samples and revisiting mastered forms while expanding toward more complex phrases and sentences that match typical development.',
  },
  'Reading': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target reading, textual, or reading-comprehension skill',
    prerequisite_lead:
      'Learner attends to print, tolerates brief academic teaching, and has enough visual, listener, and verbal skills to participate in early reading tasks.',
    materials_lead:
      'Prepare books, letters, words, print materials, comprehension questions, and any matching or picture supports needed for the current reading target.',
    sd_lead:
      'Present the print stimulus or story and give one clear reading or comprehension cue that matches the target milestone.',
    incorrect_lead:
      'Incorrect responding includes inaccurate letter, word, or story responding, no response, guessing without contact with the print or story, or needing prompts beyond the planned teaching hierarchy.',
    prompting_detail:
      'Use the least support needed, such as model reading, sound prompts, gestural tracking cues, picture supports, partial verbal prompts, or direct models, and then fade prompts so the print controls the response.',
    error_correction:
      'Model the correct reading or comprehension response briefly, guide the learner through the print or relevant story detail, and re-present the same or similar target with reduced support.',
    transfer_lead:
      'Move from highly supported letter, word, and book interactions to more independent reading, matching, and comprehension across increasingly varied print materials.',
    reinforcement_lead:
      'Use strong reinforcement for independent correct reading responses during acquisition and lighter reinforcement for prompted responses, fading toward the natural value of reading and shared-book routines.',
    generalization_lead:
      'Program across books, fonts, letters, words, stories, readers, and natural print in the environment so the learner responds accurately across formats.',
    maintenance_lead:
      'Probe mastered reading targets in daily reading routines and continue building toward broader print awareness, textual skill, and reading comprehension.',
  },
  'Writing': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target writing, tracing, copying, or spelling-by-writing response',
    prerequisite_lead:
      'Learner has enough fine-motor control, visual attention, and sitting tolerance to participate in tracing, copying, or independent writing tasks.',
    materials_lead:
      'Prepare pencils, markers, paper, tracing guides, models, and writing materials that match the target letter, number, word, or shape-writing milestone.',
    sd_lead:
      'Present the writing model or dictation cue once and allow the learner to write, trace, or copy with only the prompt level needed for success.',
    incorrect_lead:
      'Incorrect responding includes illegible or inaccurate production, omission of required parts, no response, or needing more support than the current prompt level allows.',
    prompting_detail:
      'Use the least support that still produces accurate writing, such as tracing, model prompts, gestural cues, partial physical support, or full physical guidance, and then fade prompts toward independent production.',
    error_correction:
      'Pause the task, model or guide the correct production briefly, and then re-present the same or a similar writing target with less support so the learner can practice an accurate response.',
    transfer_lead:
      'Move from tracing and copying toward smaller, more precise, and more independent writing responses, then expand to functional writing in daily activities.',
    reinforcement_lead:
      'Reinforce independent accurate writing more strongly than prompted writing, fading toward praise, finished products, and natural classroom consequences as written output improves.',
    generalization_lead:
      'Program across writing tools, surfaces, model formats, words, activities, and settings so writing stays functional outside one worksheet or one teaching table.',
    maintenance_lead:
      'Keep mastered writing targets in daily academic and leisure activities while continuing to expand legibility, independence, and written language complexity.',
  },
  'Math': {
    prompting_hierarchy: 'most_to_least',
    measurement_focus: 'the target early math or number concept',
    prerequisite_lead:
      'Learner attends to structured tasks, can manipulate or point to materials, and has the listener, VP/MTS, and early verbal skills needed for the current math concept.',
    materials_lead:
      'Prepare manipulatives, number cards, quantities, worksheets, comparison materials, and functional math items that match the target skill.',
    sd_lead:
      'Present the quantity, numeral, comparison, or math problem and give one clear SD that matches the target concept.',
    incorrect_lead:
      'Incorrect responding includes the wrong quantity or numeral, counting errors, incorrect comparisons, no response, or relying on prompts that keep the concept from becoming independent.',
    prompting_detail:
      'Use the least support needed, such as manipulatives, gestural cues, model prompts, partial physical support, or full physical guidance, and fade from concrete support toward more independent and abstract responding.',
    error_correction:
      'Model the correct counting, matching, or comparison response, guide the learner through the concept if needed, and then re-present the same or a closely related problem with reduced support.',
    transfer_lead:
      'Move from highly supported concrete math tasks to more independent responding across numerals, quantities, comparisons, and early paper-and-pencil or natural math activities.',
    reinforcement_lead:
      'Use immediate reinforcement for independent correct math responding during acquisition and lighter reinforcement for prompted responses, fading toward praise and successful participation in daily math activities.',
    generalization_lead:
      'Program across manipulatives, worksheets, games, daily routines, classrooms, and community materials so the learner uses the concept in both teaching tasks and functional contexts.',
    maintenance_lead:
      'Probe mastered math targets regularly and keep expanding the early math repertoire so number, quantity, comparison, and functional math skills remain accurate over time.',
  },
};

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getDomainName(milestone) {
  return (
    milestone.db_domain ||
    milestone.domain ||
    milestone.official_domain ||
    ''
  );
}

function buildExamplesText(milestone) {
  const example = cleanText(milestone.example).replace(/[.]+$/, '');
  if (!example) return '';
  return ` Examples: ${example}.`;
}

function buildMeasurementText(milestone, profile) {
  const detail = cleanText(milestone.measurement_detail);
  const detailText = detail ? ` during ${detail}` : '';

  switch (milestone.measurement) {
    case 'T':
      return `Use trial-by-trial data for ${profile.measurement_focus}. Record each opportunity as independent, prompted, incorrect, or no response and mix mastered and target items within the same teaching block.`;
    case 'O':
      return `Use direct observation to track ${profile.measurement_focus}. Record clear occurrences, frequency, duration, or quality of the target behavior in natural routines without over-structuring the opportunity.`;
    case 'E':
      return `Use both structured probe trials and natural-environment observation for ${profile.measurement_focus}. Record independent, prompted, incorrect, and observed spontaneous responses across teaching and generalization settings.`;
    case 'TO':
      return `Use timed observation or timed probes${detailText} for ${profile.measurement_focus}. Record the number of independent target responses during the observation window, along with any prompted or missed opportunities when relevant.`;
    default:
      return `Collect ongoing data for ${profile.measurement_focus} and record whether the response was independent, prompted, incorrect, or absent.`;
  }
}

function buildPrerequisiteText(milestone, profile) {
  const levelText =
    milestone.level > 1
      ? ` Earlier ${getDomainName(milestone).toLowerCase()} skills from prior VB-MAPP levels should already be emerging before this target is taught intensively.`
      : ' This milestone can be taught as part of an early foundational repertoire in the domain.';
  return `${profile.prerequisite_lead}${levelText}`;
}

function buildMaterialsText(milestone, profile) {
  return `${profile.materials_lead}${buildExamplesText(milestone)}`;
}

function buildSdText(milestone, profile) {
  return `${profile.sd_lead} Target milestone: ${milestone.milestone_name}.${buildExamplesText(milestone)}`;
}

function buildCorrectResponseText(milestone) {
  return `A correct response is any independent performance that satisfies the milestone requirement: ${milestone.milestone_name}.`;
}

function buildIncorrectResponseText(milestone, profile) {
  return `${profile.incorrect_lead} Any response that does not meet the milestone requirement, exceeds the planned prompt level, or breaks down partway through the task should be scored as incorrect or prompted rather than independent.`;
}

function buildTransferText(milestone, profile) {
  return `${profile.transfer_lead} Continue fading prompts until the learner can meet this milestone independently across structured teaching and naturally occurring opportunities.`;
}

function buildGeneralizationText(milestone, profile) {
  return `${profile.generalization_lead} After structured mastery, probe the same target with new people, materials, settings, and naturally occurring opportunities.`;
}

function buildMaintenanceText(milestone, profile) {
  return `${profile.maintenance_lead} Keep probing the same target after mastery so the skill remains stable while the next milestones are taught.`;
}

function buildGeneratedMilestoneTemplate(milestone) {
  const domain = getDomainName(milestone);
  const profile = DOMAIN_PROFILES[domain];

  if (!profile) {
    return {};
  }

  return {
    milestone_code: milestone.milestone_code,
    vbmapp_domain: domain,
    data_collection: `${buildMeasurementText(milestone, profile)} Target milestone: ${milestone.milestone_name}.`,
    prerequisite_skills: buildPrerequisiteText(milestone, profile),
    materials: buildMaterialsText(milestone, profile),
    sd: buildSdText(milestone, profile),
    correct_responses: buildCorrectResponseText(milestone),
    incorrect_responses: buildIncorrectResponseText(milestone, profile),
    prompting_hierarchy: profile.prompting_hierarchy,
    prompting_hierarchy_detail: profile.prompting_detail,
    error_correction: profile.error_correction,
    transfer_procedure: buildTransferText(milestone, profile),
    reinforcement_schedule: profile.reinforcement_lead,
    generalization_plan: buildGeneralizationText(milestone, profile),
    maintenance_plan: buildMaintenanceText(milestone, profile),
  };
}

module.exports = {
  buildGeneratedMilestoneTemplate,
  DOMAIN_PROFILES,
};
