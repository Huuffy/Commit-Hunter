import { useState } from "react";

function NetworkingForm({ onSubmit }) {
    const [form, setForm] = useState({
        name: "",
        college: "",
        domain: "",
        bio: "",
        linkedin: "",
        github: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);

        setForm({
            name: "",
            college: "",
            domain: "",
            bio: "",
            linkedin: "",
            github: ""
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl mb-10 space-y-4">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
            <input name="college" value={form.college} onChange={handleChange} placeholder="College" required />
            <input name="domain" value={form.domain} onChange={handleChange} placeholder="Domain (AI, Web3, etc.)" />
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Short Bio" />
            <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
            <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub URL" />

            <button type="submit" className="px-4 py-2 rounded">
                Submit
            </button>
        </form>
    );
}

export default NetworkingForm;
