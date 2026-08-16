--
-- PostgreSQL database dump
--

\restrict UaRsb9s2i5phXYC8FHsqSdaddKi2irgVDCL6itmlmk9e6AUBv98vGPLkKb1T6TX

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-08-14 13:51:16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 18023)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 18094)
-- Name: exam_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid NOT NULL,
    duration_minutes bigint DEFAULT 0,
    passcode character varying(50),
    randomize_questions boolean DEFAULT false,
    randomize_options boolean DEFAULT false,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    max_submissions bigint DEFAULT 0
);


ALTER TABLE public.exam_settings OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 18153)
-- Name: form_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid NOT NULL,
    respondent_email character varying(100) NOT NULL,
    total_score numeric,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id uuid,
    is_auto_submitted boolean DEFAULT false
);


ALTER TABLE public.form_responses OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18213)
-- Name: form_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid NOT NULL,
    duration_minutes bigint,
    auto_active_days bigint DEFAULT 30,
    is_active_immediately boolean DEFAULT false,
    is_one_time_submission boolean DEFAULT false,
    randomize_questions boolean DEFAULT false,
    randomize_options boolean DEFAULT false,
    start_time timestamp without time zone,
    end_time timestamp without time zone
);


ALTER TABLE public.form_settings OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18068)
-- Name: forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(20) DEFAULT 'SURVEY'::character varying NOT NULL,
    custom_url character varying(100),
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_template boolean DEFAULT false
);


ALTER TABLE public.forms OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18054)
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(100) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18133)
-- Name: question_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false,
    order_index bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.question_options OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18111)
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid NOT NULL,
    question_text text NOT NULL,
    question_type character varying(30) NOT NULL,
    code_language character varying(30),
    points bigint DEFAULT 1,
    order_index bigint DEFAULT 0 NOT NULL,
    is_required boolean DEFAULT false,
    img_url character varying(255),
    is_auto_scored boolean DEFAULT true,
    is_autosaved_at timestamp without time zone
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 18173)
-- Name: response_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.response_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    response_id uuid NOT NULL,
    question_id uuid NOT NULL,
    selected_option_id uuid,
    answer_text text,
    score_given numeric
);


ALTER TABLE public.response_answers OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 18034)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    avatar_url character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4946 (class 2606 OID 18104)
-- Name: exam_settings exam_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_settings
    ADD CONSTRAINT exam_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 18166)
-- Name: form_responses form_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 18225)
-- Name: form_settings form_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_settings
    ADD CONSTRAINT form_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 18086)
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 18065)
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 18146)
-- Name: question_options question_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 18126)
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 18183)
-- Name: response_answers response_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_answers
    ADD CONSTRAINT response_answers_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 18052)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 1259 OID 18110)
-- Name: idx_exam_settings_form_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_exam_settings_form_id ON public.exam_settings USING btree (form_id);


--
-- TOC entry 4956 (class 1259 OID 18172)
-- Name: idx_form_responses_form_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_form_responses_form_id ON public.form_responses USING btree (form_id);


--
-- TOC entry 4957 (class 1259 OID 18240)
-- Name: idx_form_responses_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_form_responses_user_id ON public.form_responses USING btree (user_id);


--
-- TOC entry 4964 (class 1259 OID 18231)
-- Name: idx_form_settings_form_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_form_settings_form_id ON public.form_settings USING btree (form_id);


--
-- TOC entry 4943 (class 1259 OID 18092)
-- Name: idx_forms_custom_url; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_forms_custom_url ON public.forms USING btree (custom_url);


--
-- TOC entry 4944 (class 1259 OID 18093)
-- Name: idx_forms_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_forms_user_id ON public.forms USING btree (user_id);


--
-- TOC entry 4937 (class 1259 OID 18067)
-- Name: idx_password_resets_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_resets_email ON public.password_resets USING btree (email);


--
-- TOC entry 4938 (class 1259 OID 18066)
-- Name: idx_password_resets_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_password_resets_token ON public.password_resets USING btree (token);


--
-- TOC entry 4951 (class 1259 OID 18152)
-- Name: idx_question_options_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_question_options_question_id ON public.question_options USING btree (question_id);


--
-- TOC entry 4948 (class 1259 OID 18132)
-- Name: idx_questions_form_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_questions_form_id ON public.questions USING btree (form_id);


--
-- TOC entry 4958 (class 1259 OID 18199)
-- Name: idx_response_answers_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_response_answers_question_id ON public.response_answers USING btree (question_id);


--
-- TOC entry 4959 (class 1259 OID 18200)
-- Name: idx_response_answers_response_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_response_answers_response_id ON public.response_answers USING btree (response_id);


--
-- TOC entry 4934 (class 1259 OID 18053)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4971 (class 2606 OID 18194)
-- Name: response_answers fk_form_responses_answers; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_answers
    ADD CONSTRAINT fk_form_responses_answers FOREIGN KEY (response_id) REFERENCES public.form_responses(id) ON DELETE CASCADE;


--
-- TOC entry 4969 (class 2606 OID 18167)
-- Name: form_responses fk_form_responses_form; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT fk_form_responses_form FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- TOC entry 4970 (class 2606 OID 18235)
-- Name: form_responses fk_form_responses_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT fk_form_responses_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4966 (class 2606 OID 18105)
-- Name: exam_settings fk_forms_exam_settings; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_settings
    ADD CONSTRAINT fk_forms_exam_settings FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- TOC entry 4974 (class 2606 OID 18226)
-- Name: form_settings fk_forms_form_settings; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_settings
    ADD CONSTRAINT fk_forms_form_settings FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- TOC entry 4967 (class 2606 OID 18127)
-- Name: questions fk_forms_questions; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_forms_questions FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- TOC entry 4965 (class 2606 OID 18087)
-- Name: forms fk_forms_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT fk_forms_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4968 (class 2606 OID 18147)
-- Name: question_options fk_questions_options; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT fk_questions_options FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- TOC entry 4972 (class 2606 OID 18184)
-- Name: response_answers fk_response_answers_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_answers
    ADD CONSTRAINT fk_response_answers_question FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- TOC entry 4973 (class 2606 OID 18189)
-- Name: response_answers fk_response_answers_selected_option; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response_answers
    ADD CONSTRAINT fk_response_answers_selected_option FOREIGN KEY (selected_option_id) REFERENCES public.question_options(id);


-- Completed on 2026-08-14 13:51:16

--
-- PostgreSQL database dump complete
--

\unrestrict UaRsb9s2i5phXYC8FHsqSdaddKi2irgVDCL6itmlmk9e6AUBv98vGPLkKb1T6TX

