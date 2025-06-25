'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero, actualizar los registros existentes
    await queryInterface.sequelize.query(`
      UPDATE lugares 
      SET fotos_lugar = CASE 
        WHEN fotos_lugar IS NULL OR fotos_lugar = '' THEN '[]'
        WHEN fotos_lugar LIKE '[%]%' THEN 
          CASE 
            WHEN JSON_VALID(fotos_lugar) THEN fotos_lugar
            ELSE CONCAT('["', REPLACE(REPLACE(REPLACE(fotos_lugar, '\\"', '"'), '["', ''), '"]', ''), '"]')
          END
        ELSE CONCAT('["', REPLACE(fotos_lugar, '"', '\\"'), '"]')
      END
      WHERE fotos_lugar IS NOT NULL;
    `);

    // Luego, modificar la columna para asegurar el formato correcto
    await queryInterface.changeColumn('lugares', 'fotos_lugar', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '[]',
      comment: 'Almacena un array JSON de URLs de fotos del lugar',
      get() {
        const rawValue = this.getDataValue('fotos_lugar');
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch (e) {
          console.error('Error al parsear fotos_lugar:', e);
          return [];
        }
      },
      set(value) {
        const valueToStore = Array.isArray(value) ? value : (value ? [String(value)] : []);
        this.setDataValue('fotos_lugar', JSON.stringify(valueToStore));
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios si es necesario
    await queryInterface.changeColumn('lugares', 'fotos_lugar', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '[]'
    });
  }
};
