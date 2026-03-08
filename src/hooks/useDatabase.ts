import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generic hook for fetching data
export const useFetch = (table) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: fetchedData, error } = await supabase.from(table).select('*');
            if (error) {
                setError(error);
            } else {
                setData(fetchedData);
            }
            setLoading(false);
        };
        fetchData();
    }, [table]);

    return { data, loading, error };
};

// Generic hook for inserting data
export const useInsert = (table) => {
    const insertData = async (newData) => {
        const { data, error } = await supabase.from(table).insert(newData);
        return { data, error };
    };
    return insertData;
};

// Generic hook for updating data
export const useUpdate = (table) => {
    const updateData = async (id, updatedData) => {
        const { data, error } = await supabase.from(table).update(updatedData).eq('id', id);
        return { data, error };
    };
    return updateData;
};

// Generic hook for deleting data
export const useDelete = (table) => {
    const deleteData = async (id) => {
        const { data, error } = await supabase.from(table).delete().eq('id', id);
        return { data, error };
    };
    return deleteData;
};
