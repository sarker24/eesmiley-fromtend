--
-- PostgreSQL database dump
--

--
-- Name: measurement_unit_type; Type: TYPE; Schema: public; Owner: foodwaste_migration
--

CREATE TYPE public.measurement_unit_type AS ENUM (
    'kg',
    'lt'
);


ALTER TYPE public.measurement_unit_type OWNER TO foodwaste_migration;

--
-- Name: project_status_type; Type: TYPE; Schema: public; Owner: foodwaste_migration
--

CREATE TYPE public.project_status_type AS ENUM (
    'PENDING_START',
    'RUNNING',
    'PENDING_INPUT',
    'PENDING_FOLLOWUP',
    'RUNNING_FOLLOWUP',
    'ON_HOLD',
    'FINISHED'
);


ALTER TYPE public.project_status_type OWNER TO foodwaste_migration;

--
-- Name: _final_median(anyarray); Type: FUNCTION; Schema: public; Owner: foodwaste_migration
--

CREATE FUNCTION public._final_median(anyarray) RETURNS double precision
    LANGUAGE sql IMMUTABLE
    AS $_$    WITH q AS   (      SELECT val      FROM unnest($1) val      WHERE VAL IS NOT NULL      ORDER BY 1   ),   cnt AS   (     SELECT COUNT(*) AS c FROM q   )   SELECT AVG(val)::float8   FROM    (     SELECT val FROM q     LIMIT  2 - MOD((SELECT c FROM cnt), 2)     OFFSET GREATEST(CEIL((SELECT c FROM cnt) / 2.0) - 1,0)     ) q2; $_$;


ALTER FUNCTION public._final_median(anyarray) OWNER TO foodwaste_migration;

--
-- Name: median(anyelement); Type: AGGREGATE; Schema: public; Owner: foodwaste_migration
--

CREATE AGGREGATE public.median(anyelement) (
    SFUNC = array_append,
    STYPE = anyarray,
    INITCOND = '{}',
    FINALFUNC = public._final_median
);


ALTER AGGREGATE public.median(anyelement) OWNER TO foodwaste_migration;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: _migrations; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public._migrations (
    name character varying(255),
    id bigint NOT NULL,
    service_version character varying(255),
    file bytea
);


ALTER TABLE public._migrations OWNER TO foodwaste_migration;

--
-- Name: _migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public._migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public._migrations_id_seq OWNER TO foodwaste_migration;

--
-- Name: _migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public._migrations_id_seq OWNED BY public._migrations.id;


--
-- Name: action; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.action (
    id bigint NOT NULL,
    user_id bigint,
    customer_id bigint,
    name character varying(255) NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.action OWNER TO foodwaste_migration;

--
-- Name: action_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.action_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.action_id_seq OWNER TO foodwaste_migration;

--
-- Name: action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.action_id_seq OWNED BY public.action.id;


--
-- Name: area; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.area (
    id bigint NOT NULL,
    user_id bigint,
    customer_id bigint,
    name character varying(255) NOT NULL,
    description text,
    image jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    active boolean DEFAULT true NOT NULL,
    bootstrap_key character varying(255)
);


ALTER TABLE public.area OWNER TO foodwaste_migration;

--
-- Name: area_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.area_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.area_id_seq OWNER TO foodwaste_migration;

--
-- Name: area_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.area_id_seq OWNED BY public.area.id;


--
-- Name: bootstrap; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.bootstrap (
    id bigint NOT NULL,
    translation_key character varying(255) NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.bootstrap OWNER TO foodwaste_migration;

--
-- Name: bootstrap_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.bootstrap_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bootstrap_id_seq OWNER TO foodwaste_migration;

--
-- Name: bootstrap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.bootstrap_id_seq OWNED BY public.bootstrap.id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.category (
    id bigint NOT NULL,
    user_id bigint,
    customer_id bigint,
    name character varying(255) NOT NULL,
    image jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    bootstrap_key character varying(255),
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.category OWNER TO foodwaste_migration;

--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_id_seq OWNER TO foodwaste_migration;

--
-- Name: category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.category_id_seq OWNED BY public.category.id;


--
-- Name: ingredient; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.ingredient (
    id bigint NOT NULL,
    customer_id bigint,
    name character varying(255) NOT NULL,
    cost integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    bootstrap_key character varying(255),
    unit character varying(15) DEFAULT 'kg'::character varying NOT NULL,
    currency character varying(3) DEFAULT 'DKK'::character varying NOT NULL,
    amount real DEFAULT 1 NOT NULL
);


ALTER TABLE public.ingredient OWNER TO foodwaste_migration;

--
-- Name: ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.ingredient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ingredient_id_seq OWNER TO foodwaste_migration;

--
-- Name: ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.ingredient_id_seq OWNED BY public.ingredient.id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.product (
    id bigint NOT NULL,
    user_id bigint,
    customer_id bigint,
    category_id bigint,
    name character varying(255) NOT NULL,
    cost integer NOT NULL,
    image jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    active boolean DEFAULT true NOT NULL,
    bootstrap_key character varying(255),
    amount integer DEFAULT 1000 NOT NULL,
    cost_per_kg integer
);


ALTER TABLE public.product OWNER TO foodwaste_migration;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_id_seq OWNER TO foodwaste_migration;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: product_ingredient; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.product_ingredient (
    product_id bigint NOT NULL,
    ingredient_id bigint NOT NULL,
    percentage integer,
    amount real DEFAULT 1 NOT NULL
);


ALTER TABLE public.product_ingredient OWNER TO foodwaste_migration;

--
-- Name: project; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.project (
    id bigint NOT NULL,
    parent_project_id bigint,
    user_id bigint,
    customer_id bigint,
    name character varying(255) NOT NULL,
    duration jsonb NOT NULL,
    status public.project_status_type DEFAULT 'PENDING_START'::public.project_status_type NOT NULL,
    area jsonb NOT NULL,
    product jsonb NOT NULL,
    action jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    active boolean DEFAULT true NOT NULL,
    period integer DEFAULT 1
);


ALTER TABLE public.project OWNER TO foodwaste_migration;

--
-- Name: project_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.project_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_id_seq OWNER TO foodwaste_migration;

--
-- Name: project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.project_id_seq OWNED BY public.project.id;


--
-- Name: project_registration; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.project_registration (
    project_id bigint NOT NULL,
    registration_id bigint NOT NULL
);


ALTER TABLE public.project_registration OWNER TO foodwaste_migration;

--
-- Name: registration; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.registration (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    date date NOT NULL,
    user_id bigint NOT NULL,
    amount integer NOT NULL,
    unit public.measurement_unit_type DEFAULT 'kg'::public.measurement_unit_type NOT NULL,
    currency character varying(3) DEFAULT 'DKK'::character varying NOT NULL,
    kg_per_liter integer,
    cost bigint,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    comment text,
    manual boolean DEFAULT true NOT NULL,
    scale character varying(10),
    area_id bigint NOT NULL,
    product_id bigint NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.registration OWNER TO foodwaste_migration;

--
-- Name: registration_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.registration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.registration_id_seq OWNER TO foodwaste_migration;

--
-- Name: registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.registration_id_seq OWNED BY public.registration.id;


--
-- Name: sale; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.sale (
    id bigint NOT NULL,
    user_id bigint,
    customer_id bigint,
    date date NOT NULL,
    income bigint NOT NULL,
    portions integer NOT NULL,
    portion_price bigint NOT NULL,
    guests integer NOT NULL,
    production_cost bigint NOT NULL,
    production_weight real NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.sale OWNER TO foodwaste_migration;

--
-- Name: sale_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.sale_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sale_id_seq OWNER TO foodwaste_migration;

--
-- Name: sale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.sale_id_seq OWNED BY public.sale.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.settings (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    user_id bigint NOT NULL,
    current jsonb NOT NULL,
    update_time timestamp with time zone DEFAULT now() NOT NULL,
    create_time timestamp with time zone DEFAULT now() NOT NULL,
    history jsonb NOT NULL,
    job_log jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.settings OWNER TO foodwaste_migration;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.settings_id_seq OWNER TO foodwaste_migration;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: tip; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.tip (
    id bigint NOT NULL,
    title jsonb NOT NULL,
    content jsonb NOT NULL,
    image_url character varying(255),
    is_active boolean,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tip OWNER TO foodwaste_migration;

--
-- Name: tip_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.tip_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tip_id_seq OWNER TO foodwaste_migration;

--
-- Name: tip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.tip_id_seq OWNED BY public.tip.id;


--
-- Name: upload; Type: TABLE; Schema: public; Owner: foodwaste_migration
--

CREATE TABLE public.upload (
    id bigint NOT NULL,
    file_id character varying(255) NOT NULL,
    contents jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.upload OWNER TO foodwaste_migration;

--
-- Name: upload_id_seq; Type: SEQUENCE; Schema: public; Owner: foodwaste_migration
--

CREATE SEQUENCE public.upload_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.upload_id_seq OWNER TO foodwaste_migration;

--
-- Name: upload_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: foodwaste_migration
--

ALTER SEQUENCE public.upload_id_seq OWNED BY public.upload.id;


--
-- Name: _migrations id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public._migrations ALTER COLUMN id SET DEFAULT nextval('public._migrations_id_seq'::regclass);


--
-- Name: action id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.action ALTER COLUMN id SET DEFAULT nextval('public.action_id_seq'::regclass);


--
-- Name: area id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.area ALTER COLUMN id SET DEFAULT nextval('public.area_id_seq'::regclass);


--
-- Name: bootstrap id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.bootstrap ALTER COLUMN id SET DEFAULT nextval('public.bootstrap_id_seq'::regclass);


--
-- Name: category id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.category ALTER COLUMN id SET DEFAULT nextval('public.category_id_seq'::regclass);


--
-- Name: ingredient id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.ingredient ALTER COLUMN id SET DEFAULT nextval('public.ingredient_id_seq'::regclass);


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Name: project id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.project ALTER COLUMN id SET DEFAULT nextval('public.project_id_seq'::regclass);


--
-- Name: registration id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.registration ALTER COLUMN id SET DEFAULT nextval('public.registration_id_seq'::regclass);


--
-- Name: sale id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.sale ALTER COLUMN id SET DEFAULT nextval('public.sale_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: tip id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.tip ALTER COLUMN id SET DEFAULT nextval('public.tip_id_seq'::regclass);


--
-- Name: upload id; Type: DEFAULT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.upload ALTER COLUMN id SET DEFAULT nextval('public.upload_id_seq'::regclass);


--
-- Name: action action_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.action
    ADD CONSTRAINT action_pkey PRIMARY KEY (id);


--
-- Name: area area_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.area
    ADD CONSTRAINT area_pkey PRIMARY KEY (id);


--
-- Name: bootstrap bootstrap_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.bootstrap
    ADD CONSTRAINT bootstrap_pkey PRIMARY KEY (id);


--
-- Name: ingredient ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT ingredient_pkey PRIMARY KEY (id);


--
-- Name: category product_category_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT product_category_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: registration registration_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT registration_pkey PRIMARY KEY (id);


--
-- Name: sale sale_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT sale_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: tip tip_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.tip
    ADD CONSTRAINT tip_pkey PRIMARY KEY (id);


--
-- Name: upload upload_pkey; Type: CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.upload
    ADD CONSTRAINT upload_pkey PRIMARY KEY (id);


--
-- Name: idx_bootstrap_translation_key; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE UNIQUE INDEX idx_bootstrap_translation_key ON public.bootstrap USING btree (translation_key) WHERE (deleted_at IS NULL);


--
-- Name: idx_settings_current; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX idx_settings_current ON public.settings USING gin (current);


--
-- Name: idx_settings_history; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX idx_settings_history ON public.settings USING gin (history);


--
-- Name: ix_mc_area_name_customer_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE UNIQUE INDEX ix_mc_area_name_customer_id ON public.area USING btree (customer_id, name) WHERE (deleted_at IS NULL);


--
-- Name: ix_mc_product_name_customer_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE UNIQUE INDEX ix_mc_product_name_customer_id ON public.product USING btree (customer_id, name) WHERE (deleted_at IS NULL);


--
-- Name: ix_mc_project_registration_project_id_registration_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE UNIQUE INDEX ix_mc_project_registration_project_id_registration_id ON public.project_registration USING btree (project_id, registration_id);


--
-- Name: ix_mc_registration_date_customer_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_mc_registration_date_customer_id ON public.registration USING btree (customer_id, date);


--
-- Name: ix_project_action; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_project_action ON public.project USING gin (action);


--
-- Name: ix_project_area; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_project_area ON public.project USING gin (area);


--
-- Name: ix_project_duration; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_project_duration ON public.project USING gin (duration);


--
-- Name: ix_project_product; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_project_product ON public.project USING gin (product);


--
-- Name: ix_registration_user_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_registration_user_id ON public.registration USING btree (user_id);


--
-- Name: ix_settings_user_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_settings_user_id ON public.settings USING btree (user_id);


--
-- Name: ix_tip_content; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_tip_content ON public.tip USING gin (content);


--
-- Name: ix_tip_is_active; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_tip_is_active ON public.tip USING btree (is_active);


--
-- Name: ix_tip_title; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE INDEX ix_tip_title ON public.tip USING gin (title);


--
-- Name: uix_mc_category_name_customer_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE UNIQUE INDEX uix_mc_category_name_customer_id ON public.category USING btree (customer_id, name) WHERE (deleted_at IS NULL);


--
-- Name: uix_mc_ingredient_customer_id_name; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE UNIQUE INDEX uix_mc_ingredient_customer_id_name ON public.ingredient USING btree (customer_id, name, unit);


--
-- Name: uix_mc_product_ingredient_product_id_ingredient_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE UNIQUE INDEX uix_mc_product_ingredient_product_id_ingredient_id ON public.product_ingredient USING btree (product_id, ingredient_id);


--
-- Name: uix_settings_customer_id; Type: INDEX; Schema: public; Owner: foodwaste_migration
--

CREATE UNIQUE INDEX uix_settings_customer_id ON public.settings USING btree (customer_id);


--
-- Name: product fk_product_category_category_id; Type: FK CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT fk_product_category_category_id FOREIGN KEY (category_id) REFERENCES public.category(id);


--
-- Name: product_ingredient fk_product_ingredient_ingredient_id; Type: FK CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.product_ingredient
    ADD CONSTRAINT fk_product_ingredient_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES public.ingredient(id) ON UPDATE CASCADE;


--
-- Name: product_ingredient fk_product_ingredient_product_id; Type: FK CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.product_ingredient
    ADD CONSTRAINT fk_product_ingredient_product_id FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE;


--
-- Name: project_registration fk_project_registration_project_id; Type: FK CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.project_registration
    ADD CONSTRAINT fk_project_registration_project_id FOREIGN KEY (project_id) REFERENCES public.project(id) ON UPDATE CASCADE;


--
-- Name: project_registration fk_project_registration_registration_id; Type: FK CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.project_registration
    ADD CONSTRAINT fk_project_registration_registration_id FOREIGN KEY (registration_id) REFERENCES public.registration(id) ON UPDATE CASCADE;


--
-- Name: registration fk_registration_area_area_id; Type: FK CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT fk_registration_area_area_id FOREIGN KEY (area_id) REFERENCES public.area(id) ON UPDATE CASCADE;


--
-- Name: registration fk_registration_product_product_id; Type: FK CONSTRAINT; Schema: public; Owner: foodwaste_migration
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT fk_registration_product_product_id FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE;


--
-- Name: TABLE _migrations; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public._migrations TO postgres;
GRANT SELECT ON TABLE public._migrations TO foodwaste_read;
GRANT SELECT ON TABLE public._migrations TO foodwaste_app;


--
-- Name: SEQUENCE _migrations_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON SEQUENCE public._migrations_id_seq TO postgres;


--
-- Name: TABLE action; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.action TO foodwaste_read;
GRANT ALL ON TABLE public.action TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.action TO foodwaste_app;


--
-- Name: SEQUENCE action_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.action_id_seq TO postgres;
GRANT SELECT,USAGE ON SEQUENCE public.action_id_seq TO foodwaste_read;
GRANT SELECT,USAGE ON SEQUENCE public.action_id_seq TO foodwaste_app;


--
-- Name: TABLE area; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.area TO foodwaste_read;
GRANT ALL ON TABLE public.area TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.area TO foodwaste_app;


--
-- Name: SEQUENCE area_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.area_id_seq TO postgres;
GRANT SELECT,USAGE ON SEQUENCE public.area_id_seq TO foodwaste_read;
GRANT SELECT,USAGE ON SEQUENCE public.area_id_seq TO foodwaste_app;


--
-- Name: TABLE bootstrap; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.bootstrap TO foodwaste_read;
GRANT ALL ON TABLE public.bootstrap TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.bootstrap TO foodwaste_app;


--
-- Name: SEQUENCE bootstrap_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT USAGE ON SEQUENCE public.bootstrap_id_seq TO foodwaste_read;
GRANT USAGE ON SEQUENCE public.bootstrap_id_seq TO foodwaste_app;
GRANT SELECT,USAGE ON SEQUENCE public.bootstrap_id_seq TO postgres;


--
-- Name: TABLE category; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.category TO foodwaste_read;
GRANT ALL ON TABLE public.category TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.category TO foodwaste_app;


--
-- Name: SEQUENCE category_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.category_id_seq TO postgres;
GRANT SELECT,USAGE ON SEQUENCE public.category_id_seq TO foodwaste_read;
GRANT SELECT,USAGE ON SEQUENCE public.category_id_seq TO foodwaste_app;


--
-- Name: TABLE ingredient; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.ingredient TO foodwaste_read;
GRANT ALL ON TABLE public.ingredient TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.ingredient TO foodwaste_app;


--
-- Name: SEQUENCE ingredient_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.ingredient_id_seq TO postgres;
GRANT SELECT,USAGE ON SEQUENCE public.ingredient_id_seq TO foodwaste_read;
GRANT SELECT,USAGE ON SEQUENCE public.ingredient_id_seq TO foodwaste_app;


--
-- Name: TABLE product; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.product TO foodwaste_read;
GRANT ALL ON TABLE public.product TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.product TO foodwaste_app;


--
-- Name: SEQUENCE product_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.product_id_seq TO postgres;
GRANT SELECT,USAGE ON SEQUENCE public.product_id_seq TO foodwaste_read;
GRANT SELECT,USAGE ON SEQUENCE public.product_id_seq TO foodwaste_app;


--
-- Name: TABLE product_ingredient; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.product_ingredient TO foodwaste_read;
GRANT ALL ON TABLE public.product_ingredient TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.product_ingredient TO foodwaste_app;


--
-- Name: TABLE project; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.project TO foodwaste_read;
GRANT ALL ON TABLE public.project TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.project TO foodwaste_app;


--
-- Name: SEQUENCE project_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.project_id_seq TO postgres;
GRANT SELECT,USAGE ON SEQUENCE public.project_id_seq TO foodwaste_read;
GRANT SELECT,USAGE ON SEQUENCE public.project_id_seq TO foodwaste_app;


--
-- Name: TABLE project_registration; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.project_registration TO foodwaste_read;
GRANT ALL ON TABLE public.project_registration TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.project_registration TO foodwaste_app;


--
-- Name: TABLE registration; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.registration TO foodwaste_read;
GRANT ALL ON TABLE public.registration TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.registration TO foodwaste_app;


--
-- Name: SEQUENCE registration_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.registration_id_seq TO postgres;
GRANT SELECT,USAGE ON SEQUENCE public.registration_id_seq TO foodwaste_read;
GRANT SELECT,USAGE ON SEQUENCE public.registration_id_seq TO foodwaste_app;


--
-- Name: TABLE sale; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.sale TO foodwaste_read;
GRANT ALL ON TABLE public.sale TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sale TO foodwaste_app;


--
-- Name: SEQUENCE sale_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT USAGE ON SEQUENCE public.sale_id_seq TO foodwaste_read;
GRANT USAGE ON SEQUENCE public.sale_id_seq TO foodwaste_app;
GRANT SELECT,USAGE ON SEQUENCE public.sale_id_seq TO postgres;


--
-- Name: TABLE settings; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.settings TO foodwaste_read;
GRANT ALL ON TABLE public.settings TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.settings TO foodwaste_app;


--
-- Name: SEQUENCE settings_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.settings_id_seq TO postgres;
GRANT SELECT,USAGE ON SEQUENCE public.settings_id_seq TO foodwaste_read;
GRANT SELECT,USAGE ON SEQUENCE public.settings_id_seq TO foodwaste_app;


--
-- Name: TABLE tip; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.tip TO foodwaste_read;
GRANT ALL ON TABLE public.tip TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tip TO foodwaste_app;


--
-- Name: SEQUENCE tip_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT USAGE ON SEQUENCE public.tip_id_seq TO foodwaste_read;
GRANT USAGE ON SEQUENCE public.tip_id_seq TO foodwaste_app;
GRANT SELECT,USAGE ON SEQUENCE public.tip_id_seq TO postgres;


--
-- Name: TABLE upload; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT ON TABLE public.upload TO foodwaste_read;
GRANT ALL ON TABLE public.upload TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.upload TO foodwaste_app;


--
-- Name: SEQUENCE upload_id_seq; Type: ACL; Schema: public; Owner: foodwaste_migration
--

GRANT SELECT,USAGE ON SEQUENCE public.upload_id_seq TO postgres;


--
-- PostgreSQL database dump complete
--

