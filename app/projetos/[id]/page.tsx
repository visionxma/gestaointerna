import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { ProjetoDetalheContent } from "./projeto-detalhe-content"

export async function generateStaticParams() {
  try {
    const projetosRef = collection(db, "projetos")
    const snapshot = await getDocs(projetosRef)
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
    }))
  } catch (error) {
    console.error("Erro ao gerar parâmetros estáticos:", error)
    return []
  }
}

interface ProjetoDetalhePageProps {
  params: {
    id: string
  }
}

export default function ProjetoDetalhePage({ params }: ProjetoDetalhePageProps) {
  return <ProjetoDetalheContent projetoId={params.id} />
}