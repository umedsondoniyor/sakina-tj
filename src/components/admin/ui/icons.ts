import { Clock, Users, Award, Globe, Heart, Target } from "lucide-react";

export const iconMap = { Clock, Users, Award, Globe, Heart, Target };
export const iconOptions = Object.keys(iconMap) as (keyof typeof iconMap)[];
