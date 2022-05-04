/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import { deserialize, serialize } from 'v8';
import { Pray } from 'src/types';

const fileDBDirectory = path.join(process.cwd(), '.file-db');

if (!fs.existsSync(fileDBDirectory)) {
    fs.mkdirSync(fileDBDirectory);
}

interface FileDBSchema {
    [key: string]: Record<string, any>;
}

const encodeData = (data: any) => serialize(data);
const decodeData = (data: Buffer) => deserialize(data);
const encodeDataAsync = (data: any) => serialize(data);
const decodeDataAsync = (data: Buffer) => deserialize(data);

export class FileDB<S extends FileDBSchema> {
    get<K extends keyof S>(key: K): S[K] | null {
        const dataPath = path.join(fileDBDirectory, key as string);

        if (!fs.existsSync(dataPath)) {
            return null;
        }

        const data = decodeData(fs.readFileSync(dataPath));

        return data;
    }

    async getAsync<K extends keyof S>(key: K): Promise<S[K] | null> {
        const dataPath = path.join(fileDBDirectory, key as string);

        if (!fs.existsSync(dataPath)) {
            return null;
        }

        const data = await decodeDataAsync(await fs.promises.readFile(dataPath));

        return data;
    }

    getByKey<K extends keyof S, P extends keyof S[K]>(key: K, property: P): S[K][P] | null {
        const data = this.get(key);

        if (!data) {
            return null;
        }

        return data[property];
    }

    async getByKeyAsync<K extends keyof S, P extends keyof S[K]>(key: K, property: P): Promise<S[K][P] | null> {
        const data = await this.getAsync(key);

        if (!data) {
            return null;
        }

        return data[property];
    }

    set<K extends keyof S>(key: K, data: S[K]): void {
        const dataPath = path.join(fileDBDirectory, key as string);

        fs.writeFileSync(dataPath, encodeData(data));
    }

    async setAsync<K extends keyof S>(key: K, data: S[K]): Promise<void> {
        const dataPath = path.join(fileDBDirectory, key as string);

        await fs.promises.writeFile(dataPath, await encodeDataAsync(data));
    }

    update<K extends keyof S>(key: K, updateData: S[K]): void {
        const currentData = this.get(key);

        this.set(key, { ...currentData, ...updateData });
    }

    async updateAsync<K extends keyof S>(key: K, updateData: S[K]): Promise<void> {
        const currentData = await this.getAsync(key);

        await this.setAsync(key, { ...currentData, ...updateData });
    }

    async updateByKeyAsync<K extends keyof S, P extends keyof S[K]>(
        key: K,
        property: P,
        updateData: S[K][P],
        isArray?: boolean
    ): Promise<void> {
        const currentData = await this.getAsync(key);
        const currentDataByProperty = await this.getByKeyAsync(key, property);

        if (!currentData) {
            return this.setAsync(key, {
                [property]: updateData,
            } as S[K]);
        }

        if (isArray) {
            return this.setAsync(key, {
                ...currentData,
                [property]: currentDataByProperty ? [...currentDataByProperty, ...updateData] : updateData,
            });
        }

        await this.setAsync(key, {
            ...currentData,
            [property]: currentDataByProperty ? { ...currentDataByProperty, ...updateData } : updateData,
        });
    }

    remove<K extends keyof S>(key: K): boolean {
        const dataPath = path.join(fileDBDirectory, key as string);

        if (!fs.existsSync(dataPath)) {
            return false;
        }

        fs.unlinkSync(dataPath);

        return true;
    }

    async removeAsync<K extends keyof S>(key: K): Promise<boolean> {
        const dataPath = path.join(fileDBDirectory, key as string);

        if (!fs.existsSync(dataPath)) {
            return false;
        }

        await fs.promises.unlink(dataPath);

        return true;
    }

    existsData<K extends keyof S>(key: K): boolean {
        const dataPath = path.join(fileDBDirectory, key as string);

        return fs.existsSync(dataPath);
    }
}

type ChurchFileDBSchema = {
    prayers: Record<string, Pray[]>;
};

export const churchFileDB = new FileDB<ChurchFileDBSchema>();
