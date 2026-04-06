import { Command } from "commander";
import { graphCommand } from "./commands/graph.js";
import { initCommand } from "./commands/init.js";
import {
	loginCommand,
	logoutCommand,
	whoamiCommand,
} from "./commands/login.js";
import { projectCommand } from "./commands/project.js";

const program = new Command()
	.name("kokuin")
	.description("Kokuin — graph-based codebase intelligence + AI memory")
	.version("0.1.0");

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(initCommand);
program.addCommand(projectCommand);
program.addCommand(graphCommand);

program.parse(process.argv);
