export declare class Name {
    firstName: string;
    lastName: string | null;
}
export declare const NameSchema: import("mongoose").Schema<Name, import("mongoose").Model<Name, any, any, any, import("mongoose").Document<unknown, any, Name, any> & Name & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Name, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Name>, {}> & import("mongoose").FlatRecord<Name> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
