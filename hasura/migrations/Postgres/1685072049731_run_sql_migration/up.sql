CREATE OR REPLACE FUNCTION public.nearby_user(userid uuid, distance_kms integer)
 RETURNS SETOF nearby_user_type
 LANGUAGE sql
 STABLE
AS $function$ 
(SELECT 
  u.id as user_id, 
  u.first_name,
  u.last_name,
  u.gender,
  ut.lat, 
  ut.long
FROM 
  public.user u 
  LEFT JOIN public.user_tracking ut ON u.id = ut.user_id 
where 
  (
    6371 * acos(
      cos(
        radians(23.0576179)
      ) * cos(
        radians(lat)
      ) * cos(
        radians(long) - radians(72.5444671)
      ) + sin(
        radians(23.0576179)
      ) * sin(
        radians(lat)
      )
    )
  ) < distance_kms
  ) 

  
  $function$;
