'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('comentarios', 'id_evento', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'eventos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('comentarios', 'id_evento');
  }
}; 