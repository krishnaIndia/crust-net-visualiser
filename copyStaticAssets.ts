import * as shell from "shelljs";

shell.cp("-R", "src/config", "dist/config");
shell.cp("-R", "src/public/", "dist/");
