// pages/api/projects.js
import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const project = req.body;
      const { data, error } = await supabase.from("projects").insert([project]).select();
      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    if (req.method === "PUT") {
      const { id, data: projectData } = req.body;
      const { error } = await supabase.from("projects").update(projectData).eq("id", id);
      if (error) throw error;
      return res.status(200).json({ message: "Proyecto actualizado" });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      return res.status(200).json({ message: "Proyecto eliminado" });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
