import { IDatabaseSchema } from "../../types/types";
import { DocumentSchema, DocumentSchemaDrop } from "./documents.schema";
import { FileSchema, FileSchemaDrop } from "./files.schema";
import { ProjectSchema, ProjectSchemaDrop } from "./projects.schema";
import { TokenSchema, TokenSchemaDrop } from "./tokens.schema";
import { UserSchema, UserSchemaDrop } from "./users.schema";

export const schemas: IDatabaseSchema[] = [
    { name: "users", create: UserSchema, drop: UserSchemaDrop },
    { name: "tokens", create: TokenSchema, drop: TokenSchemaDrop },
    { name: "projects", create: ProjectSchema, drop: ProjectSchemaDrop },
    { name: "documents", create: DocumentSchema, drop: DocumentSchemaDrop },
    { name: "files", create: FileSchema, drop: FileSchemaDrop },
];
