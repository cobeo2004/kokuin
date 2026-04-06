import { Command } from "commander";
import {
	loginCommand,
	logoutCommand,
	whoamiCommand,
} from "./commands/login.js";

const program = new Command()
	.name("kokuin")
	.description("Kokuin — graph-based codebase intelligence + AI memory")
	.version("0.1.0");

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);

program.parse(process.argv);
