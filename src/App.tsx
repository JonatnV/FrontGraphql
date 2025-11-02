import { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  HttpLink,
} from "@apollo/client";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:8080/graphql";

const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache(),
});

interface QueryResultProps {
  doc: any;
  vars: any;
}

function QueryResult({ doc, vars }: QueryResultProps) {
  const { loading, error, data } = useQuery(doc, { variables: vars });
  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error.message}</div>;
  return <pre style={{ background: "#f6f8fa", padding: 10 }}>{JSON.stringify(data, null, 2)}</pre>;
}

export default function App() {
  const [mode, setMode] = useState<"students" | "breed">("students");

  const breedFields = ["id", "name", "temperament", "origin", "description"];
  const studentFields = ["id", "name", "career", "semester", "gpa"];

  const [selectedBreedFields, setSelectedBreedFields] = useState<string[]>(["id", "name"]);
  const [selectedStudentFields, setSelectedStudentFields] = useState<string[]>(["id", "name", "career"]);
  const [breedId, setBreedId] = useState<string>("siam");

  const [lastQuery, setLastQuery] = useState<{ doc: any; vars: any; qStr: string } | null>(null);

  const buildQueryString = () => {
    if (mode === "students") {
      const fields = selectedStudentFields.join("\n    ");
      return `query StudentsQuery {
  students {
    ${fields}
  }
}`;
    } else {
      const fields = selectedBreedFields.join("\n    ");
      return `query BreedQuery($id: String!) {
  catBreed(id: $id) {
    ${fields}
  }
}`;
    }
  };

  const execute = () => {
    const qStr = buildQueryString();
    const doc = gql`${qStr}`;
    const vars = mode === "students" ? {} : { id: breedId };
    setLastQuery({ doc, vars, qStr });
  };

  return (
    <ApolloProvider client={client}>
      <div style={{ padding: 20 }}>
        <h1 style={{ textAlign: "center" }}>Frontend GraphQL Dinámico</h1>

        <div>
          <label>
            <input type="radio" checked={mode === "students"} onChange={() => setMode("students")} /> Students
          </label>
          <label style={{ marginLeft: 10 }}>
            <input type="radio" checked={mode === "breed"} onChange={() => setMode("breed")} /> Cat Breed
          </label>
        </div>

        {mode === "breed" && (
          <div style={{ marginTop: 10 }}>
            <div>
              ID de raza: <input value={breedId} onChange={(e) => setBreedId(e.target.value)} />
            </div>
            <div style={{ marginTop: 8 }}>
              {breedFields.map((f) => (
                <label key={f} style={{ display: "inline-block", marginRight: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedBreedFields.includes(f)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedBreedFields([...selectedBreedFields, f]);
                      else setSelectedBreedFields(selectedBreedFields.filter((x) => x !== f));
                    }}
                  />{" "}
                  {f}
                </label>
              ))}
            </div>
          </div>
        )}

        {mode === "students" && (
          <div style={{ marginTop: 10 }}>
            {studentFields.map((f) => (
              <label key={f} style={{ display: "inline-block", marginRight: 8 }}>
                <input
                  type="checkbox"
                  checked={selectedStudentFields.includes(f)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedStudentFields([...selectedStudentFields, f]);
                    else setSelectedStudentFields(selectedStudentFields.filter((x) => x !== f));
                  }}
                />{" "}
                {f}
              </label>
            ))}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={execute}>Ejecutar</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Query:</strong>
          <pre style={{ background: "#f6f8fa", padding: 8 }}>{lastQuery ? lastQuery.qStr : "Sin consulta"}</pre>
        </div>

        <div style={{ marginTop: 12 }}>
          {lastQuery ? <QueryResult doc={lastQuery.doc} vars={lastQuery.vars} /> : <div>Ejecuta una consulta</div>}
        </div>
      </div>
    </ApolloProvider>
  );
}
