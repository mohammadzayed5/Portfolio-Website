// Prints the SQL that stores the chat's private instructions (twin/*.md) in
// the Supabase table ask_twin. The twin folder is not in the repository.
// Usage: node twin-sql.mjs | pbcopy   then paste into the Supabase SQL editor and run.
import { readFile } from 'fs/promises';

const read = async (name) => (await readFile(new URL(`./twin/${name}`, import.meta.url), 'utf-8')).trim();
const systemPrompt = await read('system-prompt.md');
const knowledge = await read('knowledge.md');
const tag = '$twin$';
if ((systemPrompt + knowledge).includes(tag)) throw new Error(`The text contains ${tag}; pick another quote tag.`);

process.stdout.write(`insert into public.ask_twin (id, system_prompt, knowledge, updated_at)
values ('current', ${tag}${systemPrompt}${tag}, ${tag}${knowledge}${tag}, now())
on conflict (id) do update set system_prompt = excluded.system_prompt, knowledge = excluded.knowledge, updated_at = now();
select id, length(system_prompt) as prompt_chars, length(knowledge) as knowledge_chars, updated_at from public.ask_twin;
`);
