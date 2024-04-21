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
	
select * from public.app order by id asc;
select * from public.app_collection order by id asc;
select * from public.app_record order by id asc;

insert into public.app_record ("appKey", "collectionKey", contents) values (1,30, '{}')


TRUNCATE TABLE public.app RESTART IDENTITY;
TRUNCATE TABLE public.app_collection RESTART IDENTITY;
TRUNCATE TABLE public.app_record RESTART IDENTITY;

DROP TABLE public.app;
DROP TABLE public.app_collection;
DROP TABLE public.app_record;
