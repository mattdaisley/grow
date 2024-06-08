select 
	contents->>'display_name' as display_name 
from public.app_collection;

select *
FROM (
	select 
		jsonb_path_query(contents, '$.plugins.*') as parent,
		*
	from public.app
) q1
where jsonb_extract_path_text(parent, 'parent') = 'page'
order by id;


select * from (
	select id, jsonb_path_query(contents, '$.plugins.keyvalue()') as kv
	from public.app
) q1
where jsonb_extract_path_text(kv, 'value', 'parent') = 'page'

select * from public.plugin order by key asc;
select * from public.app order by id desc;
select * from public.app_collection order by id desc;
select * from public.app_record order by id desc;
select * from public.app_record_history order by id desc;


select  contents->>'display_name' as display_name, * from public.app_collection where "appKey" = 1 order by display_name desc;

select  
	contents->>'display_name' as display_name, 
	* 
from public.app_collection 
where "appKey" = 1 
order by display_name desc;


{{a.1.c.71.r.163.3121c66f-8b86-4b65-8afb-bca9da2fea8d}}
{{a.1.c.70.r.162.6d17dc5d-3f3a-44b8-ba7c-b78eb04eb656}}
{{a.1.c.73.r.167.14fd6ca5-9fbb-4a56-99b9-6dcbe2dbd690}}
{{a.1.c.75.r.170.d4e105aa-45d9-4981-9aa8-7578a26952ad}}

insert into public.app_record ("appKey", "collectionKey", contents) values (1,30, '{}')


TRUNCATE TABLE public.app RESTART IDENTITY;
TRUNCATE TABLE public.app_collection RESTART IDENTITY;
TRUNCATE TABLE public.app_record RESTART IDENTITY;

DROP TABLE public.app;
DROP TABLE public.app_collection;
DROP TABLE public.app_record;


