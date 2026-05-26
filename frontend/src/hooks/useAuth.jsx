import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||"https://agrivision-ai.up.railway.app/api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("agri_token")
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadUser = async () => {

      if (!token) {
        setLoading(false);
        return;
      }

      try {

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        const res = await axios.get(
          `${API}/auth/me`
        );

        setUser(res.data);

      } catch (err) {

        console.log(err);

        localStorage.removeItem("agri_token");

        setToken(null);

        setUser(null);

      } finally {

        setLoading(false);
      }
    };

    loadUser();

  }, [token]);

  const login = async (email, password) => {

    const { data } = await axios.post(
      `${API}/auth/login`,
      {
        email,
        password
      }
    );

    localStorage.setItem(
      "agri_token",
      data.token
    );

    setToken(data.token);

    setUser(data.user);

    return data;
  };

  const register = async (formData) => {

    const { data } = await axios.post(
      `${API}/auth/register`,
      formData
    );

    localStorage.setItem(
      "agri_token",
      data.token
    );

    setToken(data.token);

    setUser(data.user);

    return data;
  };

  const logout = () => {

    localStorage.removeItem("agri_token");

    delete axios.defaults.headers.common[
      "Authorization"
    ];

    setToken(null);

    setUser(null);
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);