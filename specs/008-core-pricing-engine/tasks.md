1: # Tasks: Core Pricing Engine
2: 
3: **Input**: Design documents from `/specs/008-core-pricing-engine/`
4: **Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
5: **Tests**: Tests are OPTIONAL - feature specification does not explicitly request test implementation. Tasks below exclude test tasks.
6: 
7: **Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.
8: 
9: ## Format: `[ID] [P?] [Story] Description`
10: 
11: - **[P]**: Can run in parallel (different files, no dependencies)
12: - **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
13: - Include exact file paths in descriptions
14: 
15: ## Path Conventions
16: 
17: - **Single project**: `src/`, `tests/` at repository root
18: - **Web app**: `backend/src/`, `frontend/src/`
19: - **Mobile**: `api/src/`, `ios/src/` or `android/src/`
20: - **Paths shown below**: NextJS 14.x monolithic structure per plan.md
21: 
22: ---
23: 
24: ## Phase 1: Setup (Shared Infrastructure)
25: 
26: **Purpose**: Project initialization and basic structure
27: 
28: - [X] T001 Install required dependencies in package.json (zod, @supabase/supabase-js)
29: - [X] T002 [P] Create lib directory structure (types, utils, supabase) in lib/
30: - [X] T003 [P] Create components/context directory in components/
31: - [X] T004 [P] Create components/ui directory in components/
32: 
33: ---
34: 
35: ## Phase 2: Foundational (Blocking Prerequisites)
36: 
37: **Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented
38: 
39: **⚠️ CRITICAL**: No user story work can begin until this phase is complete
40: 
41: - [X] T005 Create TypeScript type interfaces in lib/types/pricing.ts (PricingInput, PricingOutput, ServiceBreakdown)
42: - [X] T006 Create Zod validation schemas in lib/types/validation.ts (PricingInputSchema, PricingOutputSchema, ErrorResponseSchema)
43: - [X] T007 Create currency formatting utility in lib/utils/formatting.ts (formatCurrency, roundToNearestDollar)
44: - [X] T008 [P] Create validation helper functions in lib/utils/validation.ts (validatePricingInput, validateInputRanges)
45: - [X] T009 Implement pure pricing engine function in lib/pricing-engine.ts (calculatePrice with experience multiplier, geography multiplier, adjusted rates, risk buffer, profit margin, final price rounding, recommended range)
46: - [X] T010 [P] Create Supabase client utility in lib/supabase/client.ts (initializeSupabase, getSupabaseClient)
47: - [X] T011 [P] Implement server-side POST endpoint in app/api/calculate/route.ts (authenticate user, validate input, calculate price, return result)
48: - [X] T012 [P] Implement GET endpoint in app/api/services/route.ts (fetch active services with categories from Supabase)
49: - [X] T013 [P] Implement GET endpoint in app/api/categories/route.ts (fetch categories ordered by displayOrder from Supabase)
50: - [X] T014 [P] Implement GET endpoint in app/api/countries/route.ts (fetch active countries with multipliers from Supabase)
51: - [X] T015 [P] Implement GET endpoint in app/api/costs/route.ts (fetch active costs from Supabase)
52: - [X] T016 [P] Implement GET endpoint in app/api/config/route.ts (fetch global pricing config from Supabase)
53: 
54: **Checkpoint**: Foundation ready - user story implementation can now begin in parallel
55: 
56: ---
57: 
58: ## Phase 3: User Story 1 - Calculate Project Price with Complete Parameters (Priority: P1) 🎯 MVP
59: 
60: **Goal**: Enable freelancers to calculate project price by selecting services, specifying hours, inputting experience levels, choosing geographic locations, selecting optional costs, and adjusting risk and profit margins. System calculates and displays final price with breakdown of all components.
61: 
62: **Independent Test**: Enter complete set of parameters (services, hours, experience, geography, costs, risk, profit) and validate that system produces correct final price with detailed breakdown.
63: 
64: ### Implementation for User Story 1
65: 
66: - [X] T017 [P] Create PricingContext provider in components/context/PricingContext.tsx (PricingProvider component with useState for pricing parameters, setPricing function, calculate function)
67: - [X] T018 [P] Create custom hook in components/context/PricingContext.tsx (usePricing hook returns pricing, setPricing, calculate, validationErrors)
68: - [X] T019 [US1] Integrate PricingContext in wizard page (wrap wizard page in PricingProvider, use usePricing hook in step components)
69: - [X] T020 [US1] Connect service selection to PricingContext in app/wizard/components/step-inputs/service-selection.tsx (setPricing to update services array)
70: - [X] T021 [US1] Connect hours input to PricingContext in app/wizard/components/step-inputs/service-hours.tsx (setPricing to update hours for each service)
71: - [X] T022 [US1] Connect designer experience slider to PricingContext in app/wizard/components/step-inputs/experience-input.tsx (setPricing to update designerExperience)
72: - [X] T023 [US1] Connect freelance experience slider to PricingContext in app/wizard/components/step-inputs/experience-input.tsx (setPricing to update freelanceExperience)
73: - [X] T024 [US1] Connect designer country dropdown to PricingContext in app/wizard/components/step-inputs/geography-input.tsx (setPricing to update designerCountryCode, fetch countries from /api/countries)
74: - [X] T025 [US1] Connect client country dropdown to PricingContext in app/wizard/components/step-inputs/geography-input.tsx (setPricing to update clientCountryCode)
75: - [X] T026 [US1] Connect cost checkboxes to PricingContext in app/wizard/components/step-inputs/cost-selection.tsx (setPricing to update selectedCosts array, fetch costs from /api/costs)
76: - [X] T027 [US1] Connect risk buffer slider to PricingContext in app/wizard/components/step-inputs/risk-profit-input.tsx (setPricing to update riskBufferPercent, validate 0-50% range)
77: - [X] T028 [US1] Connect profit margin slider to PricingContext in app/wizard/components/step-inputs/risk-profit-input.tsx (setPricing to update profitMarginPercent, validate 10-50% range)
78: - [X] T029 [US1] Integrate client-side calculation in PricingContext in components/context/PricingContext.tsx (call calculatePrice function from lib/pricing-engine.ts, store result in state)
79: - [X] T030 [US1] Create basic live preview display in components/ui/live-preview.tsx (display finalPrice, recommendedMin, recommendedMax, simple breakdown list)
80: - [X] T031 [US1] Store calculation result to Supabase in app/wizard/page.tsx (insert Calculation record, insert CalculationService records on wizard completion)
81: 
82: **Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
83: 
84: ---
85: 
86: ## Phase 4: User Story 2 - Real-Time Preview During Input (Priority: P2)
87: 
88: **Goal**: Enable freelancers to see price update instantly as they adjust each input field without requiring manual submission.
89: 
90: **Independent Test**: Enter parameters and change each input while observing that price updates within 100ms without page reload or manual submission.
91: 
92: ### Implementation for User Story 2
93: 
94: - [X] T032 [P] Wrap LivePreview component in React.memo in components/ui/live-preview.tsx (prevent re-renders when parent state changes)
95: - [X] T033 [US2] Add useMemo for calculation result in PricingContext in components/context/PricingContext.tsx (cache pricing calculation result, recalculate only when pricing state changes)
96: - [X] T034 [US2] Add useMemo for derived values in LivePreview in components/ui/live-preview.tsx (cache finalPrice, subtotal, breakdown display)
97: - [X] T035 [US2] Split LivePreview into sub-components in components/ui/live-preview.tsx (create PriceDisplay, ServiceBreakdown, CostBreakdown, MultiplierSummary components)
98: - [X] T036 [US2] Add useCallback to input handlers in PricingContext in components/context/PricingContext.tsx (memoize event handlers passed to child components)
99: - [X] T037 [US2] Add debouncing to rapid input changes in components/context/PricingContext.tsx (debounce setPricing calls 50-100ms using setTimeout/clearTimeout)
100: - [X] T038 [US2] Optimize pricing engine performance in lib/pricing-engine.ts (use local variables, avoid unnecessary object allocations, optimize multiplication operations)
101: - [X] T039 [US2] Remove calculation from wizard page in app/wizard/page.tsx (rely on client-side calculation from PricingContext, only call server API for final validation/storage)
102: 
103: **Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
104: 
105: ---
106: 
107: ## Phase 5: User Story 3 - Validation of Input Parameters (Priority: P3)
108: 
109: **Goal**: Enable freelancers to enter project parameters with clear feedback about what needs to be corrected when inputs are invalid or out of range.
110: 
111: **Independent Test**: Enter invalid inputs (negative hours, experience outside 1-10, etc.) and validate that appropriate error messages appear.
112: 
113: ### Implementation for User Story 3
114: 
115: - [X] T040 [P] Add validation error state and real-time validation in PricingContext in components/context/PricingContext.tsx (useState for validationErrors object)
116: - [X] T041 [P] Add real-time validation in PricingContext in components/context/PricingContext.tsx (call validatePricingInput from lib/utils/validation.ts when pricing state changes, update validationErrors)
117: - [X] T042 [P] Display inline error messages in service-hours.tsx in app/wizard/components/step-inputs/service-hours.tsx (show error if hours < 0 or > maxHours)
118: - [X] T043 [P] Display inline error messages in experience-input.tsx in app/wizard/components/step-inputs/experience-input.tsx (show error if experience < 1 or > 10)
119: - [X] T044 [P] Display inline error messages in geography-input.tsx in app/wizard/components/step-inputs/geography-input.tsx (show error if country code invalid or not found)
120: - [X] T045 [P] Display inline error messages in risk-profit-input.tsx in app/wizard/components/step-inputs/risk-profit-input.tsx (show error if risk < 0 or > 50, profit < 10 or > 50)
121: - [X] T046 [P] Disable calculation button in wizard page in app/wizard/page.tsx (disable when validationErrors has any errors)
122: - [X] T047 [P] Clear error messages when user corrects input in PricingContext in components/context/PricingContext.tsx (reset validationErrors for specific field when valid input entered)
123: - [X] T048 [US3] Implement client-side validation in app/api/calculate/route.ts (reuse PricingInputSchema from lib/types/validation.ts, return 400 with field-specific errors)
124: - [X] T049 [US3] Display server-side validation errors in wizard page in app/wizard/page.tsx (catch API errors, display validationErrors from server response)
125: - [X] T050 [P] [US3] Validate zero service hours behavior in lib/pricing-engine.ts (return 0 for base cost when all hours are 0, handle gracefully)
126: - [X] T051 [P] [US3] Validate negative input handling in lib/utils/validation.ts (add explicit check for negative values in validatePricingInput, return error)
127: - [X] T052 [US3] Validate same country selection in lib/pricing-engine.ts (handle designerCountryCode == clientCountryCode case, use combined multiplier correctly)
128: - [X] T053 [US3] Validate large hour values in lib/utils/validation.ts (test with 1000+ hours, ensure calculation completes without overflow)
129: - [X] T054 [US3] Validate min/max experience values in lib/utils/validation.ts (ensure 1,1 and 10,10 boundary cases work correctly)
130: 
131: **Checkpoint**: All user stories should now be independently functional
132: 
133: ---
134: 
135: ## Phase 6: Polish & Cross-Cutting Concerns
136: 
137: **Purpose**: Improvements that affect multiple user stories
138: 
139: - [ ] T055 [P] Update documentation in docs/ (add pricing engine documentation, API reference)
140 - [ ] T056 [P] Code cleanup and refactoring (remove unused imports, consolidate duplicate functions, improve variable naming)
141 - [ ] T057 Performance optimization across all stories (profile calculation function, optimize React re-renders, add React.memo where needed)
142 - [ ] T058 Security hardening (verify RLS policies on Supabase tables, ensure authentication on all API endpoints, validate all inputs server-side)
143 - [ ] T059 [P] Add TypeScript strict mode configuration in tsconfig.json (enable strict: true, fix type errors)
144 - [ ] T060 [P] Add error boundaries in wizard page in app/wizard/page.tsx (wrap wizard in ErrorBoundary component, display user-friendly error messages)
145 - [ ] T061 [P] Verify Vercel scalability configuration (configure edge functions, ensure caching headers are optimized for 1,000 concurrent users)
146 - [ ] T062 [P] Add performance benchmarks for concurrent users (create load test script, measure pricing calculation throughput under simulated concurrent load)
147: 
148: ---
149: 
150: ## Dependencies & Execution Order
151: 
152: ### Phase Dependencies
153: 
154: - **Setup (Phase 1)**: No dependencies - can start immediately
155: - **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
156: - **User Stories (Phase 3-5)**: All depend on Foundational phase completion
157:   - User stories can then proceed in parallel (if staffed)
158:   - Or sequentially in priority order (P1 → P2 → P3)
159: - **Polish (Phase 6)**: Depends on all desired user stories being complete
160: 
161: ### User Story Dependencies
162: 
163: - **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
164: - **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 pricing engine but adds optimization layer independently
165 - **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds validation layer to US1 inputs, does not break US1
166: 
167: ### Within Each User Story
168: 
169: - Models before services (types before API endpoints)
170: - Services before endpoints (lib functions before API routes)
171: - Core implementation before integration (pricing engine before context integration)
172: - Story complete before moving to next priority
173: 
174: ### Parallel Opportunities
175: 
176: - All Setup tasks (T001-T004) marked [P] can run in parallel
177: - All Foundational tasks (T005-T016) marked [P] can run in parallel (within Phase 2)
178: - T017-T018 within US1 can run in parallel (different parts of PricingContext)
179: - T019-T028 within US1 can mostly run in parallel (different input components)
180 - T032-T039 within US2 can run in parallel (different optimization tasks)
181: - All Polish tasks (T050-T055) marked [P] can run in parallel
182: - Different user stories can be worked on in parallel by different team members
183: 
184: ---
185: 
186: ## Parallel Example: User Story 1
187: 
188: ```bash
189: # Launch PricingContext creation together:
190: Task: "Create PricingContext provider in components/context/PricingContext.tsx"
191: Task: "Create custom hook in components/context/PricingContext.tsx"
192: Task: "Create custom hook in components/context/PricingContext.tsx"
193: 
194: # Launch all input component integrations together:
195: Task: "Connect service selection to PricingContext in app/wizard/components/step-inputs/service-selection.tsx"
196: Task: "Connect hours input to PricingContext in app/wizard/components/step-inputs/service-hours.tsx"
197: Task: "Connect designer experience slider to PricingContext in app/wizard/components/step-inputs/experience-input.tsx"
198: Task: "Connect freelance experience slider to PricingContext in app/wizard/components/step-inputs/experience-input.tsx"
199: Task: "Connect designer country dropdown to PricingContext in app/wizard/components/step-inputs/geography-input.tsx"
200: Task: "Connect client country dropdown to PricingContext in app/wizard/components/step-inputs/geography-input.tsx"
201: Task: "Connect cost checkboxes to PricingContext in app/wizard/components/step-inputs/cost-selection.tsx"
202: Task: "Connect risk buffer slider to PricingContext in app/wizard/components/step-inputs/risk-profit-input.tsx"
203: Task: "Connect profit margin slider to PricingContext in app/wizard/components/step-inputs/risk-profit-input.tsx"
204: ```
205: 
206: ---
207: 
208: ## Implementation Strategy
209: 
210: ### MVP First (User Story 1 Only)
211: 
212: 1. Complete Phase 1: Setup (T001-T004)
213: 2. Complete Phase 2: Foundational (T005-T016) CRITICAL - blocks all stories
214: 3. Complete Phase 3: User Story 1 (T017-T031)
215: 4. **STOP and VALIDATE**: Test User Story 1 independently
216: 5. Deploy/demo if ready
217: 
218: ### Incremental Delivery
219: 
220: 1. Complete Setup + Foundational → Foundation ready (T001-T016)
221: 2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T017-T031)
222: 3. Add User Story 2 → Test independently → Deploy/Demo (T032-T039)
223: 4. Add User Story 3 → Test independently → Deploy/Demo (T040-T054)
224: 5. Each story adds value without breaking previous stories
225: 
226: ### Parallel Team Strategy
227: 
228: With multiple developers:
229: 
230: 1. Team completes Setup + Foundational together (T001-T016)
231: 2. Once Foundational is done:
232:    - Developer A: User Story 1 (T017-T031)
233:    - Developer B: User Story 2 (T032-T039)
234:    - Developer C: User Story 3 (T040-T054)
235: 3. Stories complete and integrate independently
236: 4. Team collaborates on Polish (T055-T062)
237: 
238: ---
239: 
240: ## Summary
241: 
242: **Total Tasks**: 62
243: **Tasks per User Story**:
244: - User Story 1 (P1): 15 tasks (T017-T031)
245: - User Story 2 (P2): 8 tasks (T032-T039)
246: - User Story 3 (P3): 15 tasks (T040-T054)
247: 
248: **Parallel Opportunities Identified**:
249: - Setup phase: 3 parallel tasks (T002-T004)
250: - Foundational phase: 12 parallel tasks (T005-T016)
251: - User Story 1: 9 parallel tasks (T017, T018, T019-T028)
252: - User Story 2: 8 parallel tasks (T032-T039)
253 - User Story 3: 13 parallel tasks (T040-T047, T049-T050-T054)
254: - Polish phase: 7 parallel tasks (T050-T055, T060, T061, T062)
255: 
256: **Independent Test Criteria per Story**:
257: - **User Story 1**: Enter complete set of parameters (services, hours, experience, geography, costs, risk, profit) and validate that system produces correct final price with detailed breakdown
258: - **User Story 2**: Enter parameters and change each input while observing that price updates within 100ms without page reload or manual submission
259: - **User Story 3**: Enter invalid inputs (negative hours, experience outside 1-10, etc.) and validate that appropriate error messages appear, including edge cases (zero hours, same country, 1000+ hours, min/max experience)
260: 
261: **Suggested MVP Scope**: User Story 1 (P1) only - delivers core pricing calculation functionality that enables freelancers to calculate project fees with complete breakdown
262: 
263: **Format Validation**:
264: ✅ ALL 62 tasks follow checklist format (checkbox, ID, labels, file paths)
265: ✅ Every task has exact file path
266: ✅ Story labels (US1, US2, US3) applied to user story phases only
267: ✅ Parallel markers ([P]) applied where appropriate
268: ✅ Tasks organized by phase and user story for independent implementation
269: 
270: ---
271: 
272: ## Notes
273: 
274: - [P] tasks = different files, no dependencies
275: - [Story] label maps task to specific user story for traceability
276: - Each user story should be independently completable and testable
277: - Commit after each task or logical group
278: - Stop at any checkpoint to validate story independently
279: - Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

(End of file - total 279 lines)
