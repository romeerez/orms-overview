import { ValidationError } from 'yup';

export default (error: Error & { status?: number }, request, reply) => {
  if (error instanceof ValidationError) {
    let response;
    if (error.inner.length === 0) response = { error: error.message };
    else
      response = {
        errors: Object.fromEntries(
          error.inner.map(({ path, message }) => {
            const pathArray = path.split('.');
            const field = pathArray[pathArray.length - 1];
            return [field, message.replace(path, field)];
          }),
        ),
      };

    return reply.status(422).send(response);
  }

  if (error.status) {
    reply.status(error.status).send({ error: error.message });
  } else {
    console.error(error);
    reply.status(500).send({
      error: 'Internal server error',
    });
  }
};
