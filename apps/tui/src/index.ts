import { Command } from "commander";
import { graphCommand } from "./commands/graph.js";
import { initCommand } from "./commands/init.js";
import {
	loginCommand,
	logoutCommand,
	whoamiCommand,
} from "./commands/login.js";
import { projectCommand } from "./commands/project.js";

const KOKUIN_ASCII = String.raw`
 _  __     _          _
| |/ /___ | | ___   _(_)_ __
| ' // _ \| |/ / | | | | '_ \
| . \ (_) |   <| |_| | | | | |
|_|\_\___/|_|\_\\__,_|_|_| |_|
`;

const KOKUIN_TAGLINE = '"Engraved in stillness. Retrieved in a flash."';

const program = new Command()
	.name("kokuin")
	.description("Kokuin — graph-based codebase intelligence + AI memory")
	.version("0.1.0")
	.addHelpText("beforeAll", `${KOKUIN_ASCII}\n${KOKUIN_TAGLINE}\n\n`);

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(initCommand);
program.addCommand(projectCommand);
program.addCommand(graphCommand);

if (process.argv.length <= 2) {
	program.outputHelp();
	process.exit(0);
}

program.parse(process.argv);
