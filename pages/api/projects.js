import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) return res.status(500).json({ error });
    res.status(200).json(data);

  } else if (req.method === 'POST') {
    const { name, image } = req.body;
    const { data, error } = await supabase.from('projects').insert([{ name, image }]).select();
    if (error) return res.status(500).json({ error });
    res.status(200).json(data[0]);

  } else if (req.method === 'PUT') {
    const { id, data: projectData } = req.body;
    const { error } = await supabase.from('projects').update(projectData).eq('id', id);
    if (error) return res.status(500).json({ error });
    res.status(200).json({ success: true });

  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return res.status(500).json({ error });
    res.status(200).json({ success: true });

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}