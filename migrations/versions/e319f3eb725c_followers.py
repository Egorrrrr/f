"""followers

Revision ID: e319f3eb725c
Revises: b4900f73bfe0
Create Date: 2022-05-20 18:01:13.836315

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e319f3eb725c'
down_revision = 'b4900f73bfe0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('followers',
    sa.Column('follower_id', sa.Integer(), nullable=True),
    sa.Column('followed_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['followed_id'], ['user_class.id'], ),
    sa.ForeignKeyConstraint(['follower_id'], ['user_class.id'], )
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('followers')
    # ### end Alembic commands ###