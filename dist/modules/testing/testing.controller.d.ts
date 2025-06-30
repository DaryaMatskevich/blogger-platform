import { Connection } from 'mongoose';
export declare class TestingController {
    private readonly databaseConnection;
    constructor(databaseConnection: Connection);
    deleteAll(): Promise<{
        status: string;
    }>;
}
