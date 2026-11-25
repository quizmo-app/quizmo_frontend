import { container } from './di/container'
import { TableauDeBordPage } from '../features/courses/ui/TableauDeBordPage'

function App() {
  return (
    <TableauDeBordPage
      coursRepository={container.coursRepository}
      quizRepository={container.quizRepository}
      insertionRepository={container.insertionRepository}
    />
  )
}

export default App
