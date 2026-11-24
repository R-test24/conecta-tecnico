export const roles = ["estudante","empresa","escola"] as const;
export type Role = typeof roles[number];
export type Profile = {name:string;role:Role};
export type DemoData = {
  events:string[];
  jobs:string[];
  posts:{id:string;title:string;type:string;description:string;image?:string;date?:string;time?:string;city?:string;location?:string;course?:string;seats?:number;requirements?:string}[];
};
export const emptyData:DemoData = {events:[],jobs:[],posts:[]};
export function readProfile():Profile | null {
  try {
    const item = JSON.parse(sessionStorage.getItem("conecta-profile") ?? "null") as Profile | null;
    return item && typeof item.name === "string" && (item.role === "estudante" || item.role === "escola") ? item : null;
  } catch {return null;}
}
const key = (profile:Profile) => "conecta-demo:" + profile.role + ":" + profile.name;
export function readData(profile:Profile):DemoData {
  try {return JSON.parse(localStorage.getItem(key(profile)) ?? "null") ?? emptyData;}
  catch {return emptyData;}
}
export function saveData(profile:Profile, data:DemoData) {
  localStorage.setItem(key(profile),JSON.stringify(data));
}
