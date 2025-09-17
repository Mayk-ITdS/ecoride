import { useState } from "react";
import HeaderRegister from "@/components/Register/HeaderRegister";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    pseudo: "",
    email: "",
    password: "",
    confirm: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    try {
      const response = await axios.post(`/api/users/register`, {
        pseudo: form.pseudo,
        email: form.email,
        password: form.password,
      });
      console.log("User created:", response.data);
      alert("Inscription réussie !");
    } catch (error) {
      console.error("Erreur register:", error);
      alert("Erreur lors de l'inscription");
    }
  };
  return (
    <section className="min-h-screen flex flex-col bg-gradient-radial from-green-100 via-green-200 to-green-400 px-4">
      <HeaderRegister />
      <section className="flex flex-1 flex-col justify-center items-center w-full font-display ">
        <form
          onSubmit={handleRegister}
          className="relative w-full max-w-2xl flex flex-col gap-6 text-center justify-center"
        >
          <legend className="text-5xl font-bold text-left pb-10 text-gray-800">
            Créer un <span className="text-ecoPurple">compte</span>
          </legend>
          <fieldset className="flex flex-col gap-3">
            <div>
              <label htmlFor="pseudo" className="flex px-3">
                Pseudonyme
              </label>
              <input
                value={form.pseudo}
                onChange={handleChange}
                id="pseudo"
                name="pseudo"
                type="text"
                placeholder="Pseudonyme"
                className="w-full px-6 py-6 mb-3 border border-gray-400 rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-ecoGreen"
              />
            </div>
            <div>
              <label htmlFor="email" className="flex px-3">
                Email
              </label>
              <input
                id="email"
                name="email"
                onChange={handleChange}
                value={form.email}
                type="email"
                placeholder="Email"
                className="w-full px-6 py-6 mb-3 border border-gray-400 rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-ecoGreen"
              />
            </div>
            <div>
              <label htmlFor="password" className="flex text-left px-3">
                Password
              </label>
              <input
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
                className="w-full px-6 py-6 mb-3 border border-gray-400 rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-ecoGreen"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="flex text-left px-3">
                Confirm a password
              </label>

              <input
                id="confirm"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                type="password"
                placeholder="Confirmation du password"
                className="w-full px-6 py-6 mb-3 border border-gray-400 rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-ecoGreen"
              />
            </div>
          </fieldset>
          <p className="text-xs text-gray-700">
            By continuing, you agree to the{" "}
            <a href="#" className="underline">
              Terms of use
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
          <button
            type="submit"
            className="w-full py-5 rounded-full bg-ecoPurple text-white font-semibold hover:bg-purple-700 transition"
          >
            S’inscrire
          </button>
          <p className="text-sm text-gray-700">
            Deja un compte ?{" "}
            <a href="/login" className="font-semibold underline">
              Se connecter
            </a>
          </p>
        </form>
      </section>
    </section>
  );
};
export default Register;
