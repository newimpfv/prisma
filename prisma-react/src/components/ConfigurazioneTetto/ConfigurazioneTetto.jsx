import { useForm } from '../../context/FormContext';
import Falde from '../Falde/Falde';
import Tettoie from '../Tettoie/Tettoie';

const ConfigurazioneTetto = () => {
  const { structureData } = useForm();

  // Mostra Tettoie se il tipo di tetto è 'tettoia' o 'a terra', altrimenti mostra Falde
  if (structureData.tipoTetto === 'tettoia' || structureData.tipoTetto === 'a terra') {
    return <Tettoie />;
  }

  return <Falde />;
};

export default ConfigurazioneTetto;
